import Stripe from "stripe";
import { db } from "../db";
import { users, orders, instantPayouts, notifications } from "@shared/schema";
import { eq, and, sql, sum } from "drizzle-orm";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

export interface PayoutBalance {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  currency: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  stripePayoutId?: string;
  amount?: number;
  estimatedArrival?: Date;
  error?: string;
}

export class InstantPayoutService {
  /**
   * Calculate user's available balance from completed marketplace orders
   */
  async calculateAvailableBalance(userId: string): Promise<PayoutBalance> {
    try {
      // Get total earnings from completed orders where user is the seller
      const result = await db
        .select({
          totalEarnings: sum(orders.amountCents),
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.sellerId, userId),
            eq(orders.status, 'completed')
          )
        )
        .execute();

      const totalEarningsCents = Number(result[0]?.totalEarnings || 0);
      const totalEarnings = totalEarningsCents / 100;

      // Get user's current available balance and total payouts
      const [user] = await db
        .select({
          availableBalance: users.availableBalance,
          totalPayouts: users.totalPayouts,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      const availableBalance = Number(user.availableBalance || 0);
      const totalPayouts = Number(user.totalPayouts || 0);

      // Calculate pending balance (earnings that haven't been paid out yet)
      const pendingBalance = Math.max(0, totalEarnings - totalPayouts);

      return {
        availableBalance,
        pendingBalance,
        totalEarnings,
        currency: 'usd',
      };
    } catch (error) {
      console.error('Error calculating available balance:', error);
      throw new Error('Failed to calculate available balance');
    }
  }

  /**
   * Update user's available balance based on new sales
   */
  async updateAvailableBalance(userId: string, amount: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          availableBalance: sql`${users.availableBalance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating available balance:', error);
      throw new Error('Failed to update available balance');
    }
  }

  /**
   * Verify Stripe Connect Express account status
   */
  async verifyStripeAccount(userId: string): Promise<{
    verified: boolean;
    accountId?: string;
    requiresOnboarding?: boolean;
    error?: string;
  }> {
    try {
      if (!stripe) {
        return {
          verified: false,
          error: 'Stripe not configured',
        };
      }

      // Get user's Stripe Connected Account ID
      const [user] = await db
        .select({
          stripeConnectedAccountId: users.stripeConnectedAccountId,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || !user.stripeConnectedAccountId) {
        return {
          verified: false,
          requiresOnboarding: true,
          error: 'No Stripe account connected',
        };
      }

      // Verify account with Stripe
      const account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);

      // Check if account is verified and can receive payouts
      const canReceivePayouts = account.payouts_enabled && account.charges_enabled;

      if (!canReceivePayouts) {
        return {
          verified: false,
          accountId: user.stripeConnectedAccountId,
          requiresOnboarding: !account.details_submitted,
          error: 'Account verification incomplete',
        };
      }

      return {
        verified: true,
        accountId: user.stripeConnectedAccountId,
        requiresOnboarding: false,
      };
    } catch (error: any) {
      console.error('Error verifying Stripe account:', error);
      return {
        verified: false,
        error: error.message || 'Failed to verify Stripe account',
      };
    }
  }

  /**
   * Create Stripe Connect Express account link for onboarding
   */
  async createAccountLink(userId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured');
      }

      // Get or create Stripe Connected Account
      const [user] = await db
        .select({
          stripeConnectedAccountId: users.stripeConnectedAccountId,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      let accountId = user.stripeConnectedAccountId;

      // Create account if it doesn't exist
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
          },
          settings: {
            payouts: {
              schedule: {
                interval: 'manual', // Allow instant payouts
              },
            },
          },
        });

        accountId = account.id;

        // Save account ID to database
        await db
          .update(users)
          .set({
            stripeConnectedAccountId: accountId,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error: any) {
      console.error('Error creating account link:', error);
      throw new Error(error.message || 'Failed to create account link');
    }
  }

  /**
   * Request instant payout (T+0 settlement) via Stripe Express
   */
  async requestInstantPayout(
    userId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<PayoutResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe not configured',
        };
      }

      // Verify Stripe account
      const accountVerification = await this.verifyStripeAccount(userId);
      if (!accountVerification.verified) {
        return {
          success: false,
          error: accountVerification.error || 'Account not verified',
        };
      }

      // Check available balance
      const balance = await this.calculateAvailableBalance(userId);
      if (balance.availableBalance < amount) {
        return {
          success: false,
          error: `Insufficient balance. Available: $${balance.availableBalance.toFixed(2)}`,
        };
      }

      // Create payout record in database (pending)
      const [payoutRecord] = await db
        .insert(instantPayouts)
        .values({
          userId,
          amount: amount.toString(),
          currency,
          status: 'pending',
        })
        .returning();

      try {
        // Create instant payout via Stripe (T+0)
        const payout = await stripe.payouts.create(
          {
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            method: 'instant', // T+0 instant payout
            description: `Instant payout for marketplace sales`,
            metadata: {
              userId,
              payoutId: payoutRecord.id,
            },
          },
          {
            stripeAccount: accountVerification.accountId,
          }
        );

        // Update payout record with Stripe payout ID
        await db
          .update(instantPayouts)
          .set({
            stripePayoutId: payout.id,
            status: payout.status,
            metadata: {
              estimatedArrival: payout.arrival_date,
              method: payout.method,
            },
          })
          .where(eq(instantPayouts.id, payoutRecord.id));

        // Deduct amount from available balance
        await db
          .update(users)
          .set({
            availableBalance: sql`${users.availableBalance} - ${amount}`,
            totalPayouts: sql`${users.totalPayouts} + ${amount}`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        // Send notification
        await db.insert(notifications).values({
          userId,
          type: 'payout',
          title: 'Payout Initiated',
          message: `Your instant payout of $${amount.toFixed(2)} has been initiated and will arrive within minutes.`,
          metadata: {
            payoutId: payoutRecord.id,
            amount,
            estimatedArrival: payout.arrival_date,
          },
        });

        return {
          success: true,
          payoutId: payoutRecord.id,
          stripePayoutId: payout.id,
          amount,
          estimatedArrival: new Date(payout.arrival_date * 1000),
        };
      } catch (stripeError: any) {
        // Update payout record as failed
        await db
          .update(instantPayouts)
          .set({
            status: 'failed',
            failureReason: stripeError.message,
          })
          .where(eq(instantPayouts.id, payoutRecord.id));

        // Send failure notification
        await db.insert(notifications).values({
          userId,
          type: 'payout',
          title: 'Payout Failed',
          message: `Your payout request failed: ${stripeError.message}`,
          metadata: {
            payoutId: payoutRecord.id,
            error: stripeError.message,
          },
        });

        return {
          success: false,
          error: stripeError.message || 'Payout failed',
        };
      }
    } catch (error: any) {
      console.error('Error requesting instant payout:', error);
      return {
        success: false,
        error: error.message || 'Failed to request payout',
      };
    }
  }

  /**
   * Get payout history for user
   */
  async getPayoutHistory(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const payouts = await db
        .select()
        .from(instantPayouts)
        .where(eq(instantPayouts.userId, userId))
        .orderBy(sql`${instantPayouts.requestedAt} DESC`)
        .limit(limit)
        .offset(offset);

      return payouts;
    } catch (error) {
      console.error('Error fetching payout history:', error);
      throw new Error('Failed to fetch payout history');
    }
  }

  /**
   * Get payout status by ID
   */
  async getPayoutStatus(payoutId: string) {
    try {
      const [payout] = await db
        .select()
        .from(instantPayouts)
        .where(eq(instantPayouts.id, payoutId))
        .limit(1);

      if (!payout) {
        throw new Error('Payout not found');
      }

      // If we have a Stripe payout ID and it's still pending, check status with Stripe
      if (payout.stripePayoutId && payout.status === 'pending' && stripe) {
        try {
          const [user] = await db
            .select({ stripeConnectedAccountId: users.stripeConnectedAccountId })
            .from(users)
            .where(eq(users.id, payout.userId))
            .limit(1);

          if (user?.stripeConnectedAccountId) {
            const stripePayout = await stripe.payouts.retrieve(
              payout.stripePayoutId,
              { stripeAccount: user.stripeConnectedAccountId }
            );

            // Update status if changed
            if (stripePayout.status !== payout.status) {
              await db
                .update(instantPayouts)
                .set({
                  status: stripePayout.status,
                  completedAt: stripePayout.status === 'paid' ? new Date() : null,
                  failureReason: stripePayout.failure_message || null,
                })
                .where(eq(instantPayouts.id, payoutId));

              payout.status = stripePayout.status;
              if (stripePayout.status === 'paid') {
                payout.completedAt = new Date();
              }
            }
          }
        } catch (stripeError) {
          console.error('Error checking Stripe payout status:', stripeError);
        }
      }

      return payout;
    } catch (error) {
      console.error('Error fetching payout status:', error);
      throw new Error('Failed to fetch payout status');
    }
  }

  /**
   * Handle Stripe payout webhook events
   */
  async handlePayoutWebhook(event: Stripe.Event): Promise<void> {
    try {
      const payout = event.data.object as Stripe.Payout;

      // Find payout record by Stripe payout ID
      const [payoutRecord] = await db
        .select()
        .from(instantPayouts)
        .where(eq(instantPayouts.stripePayoutId, payout.id))
        .limit(1);

      if (!payoutRecord) {
        console.log('Payout record not found for webhook:', payout.id);
        return;
      }

      // Update status based on event type
      let status = payoutRecord.status;
      let completedAt = payoutRecord.completedAt;
      let failureReason = payoutRecord.failureReason;

      switch (event.type) {
        case 'payout.paid':
          status = 'completed';
          completedAt = new Date();
          
          // Send success notification
          await db.insert(notifications).values({
            userId: payoutRecord.userId,
            type: 'payout',
            title: 'Payout Completed',
            message: `Your payout of $${Number(payoutRecord.amount).toFixed(2)} has been completed and is on its way to your bank account.`,
            metadata: {
              payoutId: payoutRecord.id,
              amount: payoutRecord.amount,
            },
          });
          break;

        case 'payout.failed':
          status = 'failed';
          failureReason = payout.failure_message || 'Unknown error';
          
          // Refund balance to user
          await db
            .update(users)
            .set({
              availableBalance: sql`${users.availableBalance} + ${payoutRecord.amount}`,
              totalPayouts: sql`${users.totalPayouts} - ${payoutRecord.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, payoutRecord.userId));

          // Send failure notification
          await db.insert(notifications).values({
            userId: payoutRecord.userId,
            type: 'payout',
            title: 'Payout Failed',
            message: `Your payout failed: ${failureReason}. The amount has been returned to your available balance.`,
            metadata: {
              payoutId: payoutRecord.id,
              error: failureReason,
            },
          });
          break;

        case 'payout.canceled':
          status = 'cancelled';
          
          // Refund balance to user
          await db
            .update(users)
            .set({
              availableBalance: sql`${users.availableBalance} + ${payoutRecord.amount}`,
              totalPayouts: sql`${users.totalPayouts} - ${payoutRecord.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, payoutRecord.userId));
          break;
      }

      // Update payout record
      await db
        .update(instantPayouts)
        .set({
          status,
          completedAt,
          failureReason,
        })
        .where(eq(instantPayouts.id, payoutRecord.id));
    } catch (error) {
      console.error('Error handling payout webhook:', error);
      throw error;
    }
  }
}

export const instantPayoutService = new InstantPayoutService();
