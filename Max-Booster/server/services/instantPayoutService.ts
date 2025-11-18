import Stripe from 'stripe';
import { db } from '../db';
import { users, orders, instantPayouts, notifications } from '@shared/schema';
import { eq, and, sql, sum } from 'drizzle-orm';
import { logger } from '../logger.js';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' })
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
        .where(and(eq(orders.sellerId, userId), eq(orders.status, 'completed')))
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
    } catch (error: unknown) {
      logger.error('Error calculating available balance:', error);
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
    } catch (error: unknown) {
      logger.error('Error updating available balance:', error);
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
    } catch (error: unknown) {
      logger.error('Error verifying Stripe account:', error);
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
    } catch (error: unknown) {
      logger.error('Error creating account link:', error);
      throw new Error(error.message || 'Failed to create account link');
    }
  }

  /**
   * Create instant transfer to seller's connected account (for marketplace sales)
   * This is the CORRECT method for marketplace payouts - transfers FROM platform TO seller
   */
  async createInstantTransfer(
    userId: string,
    amount: number,
    orderId: string,
    platformFeePercentage: number = 10,
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
        // Seller not onboarded - store payout as pending
        logger.warn(`Seller ${userId} not onboarded to Stripe Connect. Payout delayed.`);

        await db.insert(notifications).values({
          userId,
          type: 'payout',
          title: 'Payout Pending - Action Required',
          message: `You have a pending payout of $${amount.toFixed(2)}, but you need to connect your bank account first to receive payments.`,
          metadata: {
            amount,
            orderId,
            action: 'connect_bank_account',
          },
        });

        return {
          success: false,
          error: 'Seller must complete Stripe Connect onboarding',
        };
      }

      // Calculate platform fee and seller amount
      const platformFee = amount * (platformFeePercentage / 100);
      const sellerAmount = amount - platformFee;

      // Create payout record in database (pending)
      const [payoutRecord] = await db
        .insert(instantPayouts)
        .values({
          userId,
          amount: sellerAmount.toString(),
          currency,
          status: 'pending',
          metadata: {
            orderId,
            totalAmount: amount,
            platformFee,
            platformFeePercentage,
          },
        })
        .returning();

      try {
        // Create TRANSFER from platform to seller's connected account
        const transfer = await stripe.transfers.create({
          amount: Math.round(sellerAmount * 100), // Convert to cents
          currency,
          destination: accountVerification.accountId!,
          description: `Marketplace sale payout - Order #${orderId}`,
          metadata: {
            userId,
            payoutId: payoutRecord.id,
            orderId,
            platformFee: platformFee.toFixed(2),
          },
        });

        // Update payout record with Stripe transfer ID
        await db
          .update(instantPayouts)
          .set({
            stripePayoutId: transfer.id,
            status: 'in_transit',
            metadata: {
              orderId,
              totalAmount: amount,
              platformFee,
              platformFeePercentage,
              transferId: transfer.id,
              transferredAt: new Date().toISOString(),
            },
          })
          .where(eq(instantPayouts.id, payoutRecord.id));

        // Update seller's total payouts
        await db
          .update(users)
          .set({
            totalPayouts: sql`${users.totalPayouts} + ${sellerAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        // Send success notification
        await db.insert(notifications).values({
          userId,
          type: 'payout',
          title: 'Payout Sent!',
          message: `Your payout of $${sellerAmount.toFixed(2)} has been sent to your bank account and will arrive within 1-2 business days.`,
          metadata: {
            payoutId: payoutRecord.id,
            amount: sellerAmount,
            platformFee,
            orderId,
          },
        });

        return {
          success: true,
          payoutId: payoutRecord.id,
          stripePayoutId: transfer.id,
          amount: sellerAmount,
        };
      } catch (stripeError: unknown) {
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
          message: `Your payout failed: ${stripeError.message}. Please contact support if this continues.`,
          metadata: {
            payoutId: payoutRecord.id,
            error: stripeError.message,
            orderId,
          },
        });

        return {
          success: false,
          error: stripeError.message || 'Transfer failed',
        };
      }
    } catch (error: unknown) {
      logger.error('Error creating instant transfer:', error);
      return {
        success: false,
        error: error.message || 'Failed to create transfer',
      };
    }
  }

  /**
   * Request manual payout (for accumulated balance withdrawal)
   * Uses Stripe Payouts to pay out FROM connected account TO bank
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
        // Create payout via Stripe (pays from connected account to bank)
        const payout = await stripe.payouts.create(
          {
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            description: `Manual payout withdrawal`,
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
          title: 'Withdrawal Initiated',
          message: `Your withdrawal of $${amount.toFixed(2)} has been initiated and will arrive within minutes.`,
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
      } catch (stripeError: unknown) {
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
          title: 'Withdrawal Failed',
          message: `Your withdrawal request failed: ${stripeError.message}`,
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
    } catch (error: unknown) {
      logger.error('Error requesting instant payout:', error);
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
    } catch (error: unknown) {
      logger.error('Error fetching payout history:', error);
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
            const stripePayout = await stripe.payouts.retrieve(payout.stripePayoutId, {
              stripeAccount: user.stripeConnectedAccountId,
            });

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
        } catch (stripeError: unknown) {
          logger.error('Error checking Stripe payout status:', stripeError);
        }
      }

      return payout;
    } catch (error: unknown) {
      logger.error('Error fetching payout status:', error);
      throw new Error('Failed to fetch payout status');
    }
  }

  /**
   * Handle Stripe transfer webhook events (for marketplace payouts)
   */
  async handleTransferWebhook(event: Stripe.Event): Promise<void> {
    try {
      const transfer = event.data.object as Stripe.Transfer;

      // Find payout record by Stripe transfer ID
      const [payoutRecord] = await db
        .select()
        .from(instantPayouts)
        .where(eq(instantPayouts.stripePayoutId, transfer.id))
        .limit(1);

      if (!payoutRecord) {
        logger.info('Payout record not found for transfer webhook:', transfer.id);
        return;
      }

      // Update status based on event type
      let status = payoutRecord.status;
      let completedAt = payoutRecord.completedAt;
      let failureReason = payoutRecord.failureReason;

      switch (event.type) {
        case 'transfer.created':
          status = 'in_transit';
          logger.info('Transfer created:', transfer.id);
          break;

        case 'transfer.paid':
          status = 'completed';
          completedAt = new Date();

          // Send success notification
          await db.insert(notifications).values({
            userId: payoutRecord.userId,
            type: 'payout',
            title: 'Money Received!',
            message: `Your payout of $${Number(payoutRecord.amount).toFixed(2)} has been successfully transferred to your bank account.`,
            metadata: {
              payoutId: payoutRecord.id,
              amount: payoutRecord.amount,
              transferId: transfer.id,
            },
          });
          break;

        case 'transfer.failed':
          status = 'failed';
          failureReason = transfer.failure_message || 'Transfer failed';

          // Reverse the transfer - add back to seller's available balance
          await db
            .update(users)
            .set({
              availableBalance: sql`${users.availableBalance} + ${payoutRecord.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, payoutRecord.userId));

          // Send failure notification
          await db.insert(notifications).values({
            userId: payoutRecord.userId,
            type: 'payout',
            title: 'Payout Failed',
            message: `Your payout of $${Number(payoutRecord.amount).toFixed(2)} failed: ${failureReason}. The amount has been returned to your available balance. Please ensure your bank account is verified.`,
            metadata: {
              payoutId: payoutRecord.id,
              error: failureReason,
              transferId: transfer.id,
            },
          });
          break;

        case 'transfer.reversed':
          status = 'refunded';

          // Add back to seller's available balance
          await db
            .update(users)
            .set({
              availableBalance: sql`${users.availableBalance} + ${payoutRecord.amount}`,
              totalPayouts: sql`${users.totalPayouts} - ${payoutRecord.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, payoutRecord.userId));

          // Send notification
          await db.insert(notifications).values({
            userId: payoutRecord.userId,
            type: 'payout',
            title: 'Payout Reversed',
            message: `Your payout of $${Number(payoutRecord.amount).toFixed(2)} was reversed and the funds have been returned to your available balance.`,
            metadata: {
              payoutId: payoutRecord.id,
              transferId: transfer.id,
            },
          });
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
    } catch (error: unknown) {
      logger.error('Error handling transfer webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe account webhook events (for Connect onboarding status)
   */
  async handleAccountWebhook(event: Stripe.Event): Promise<void> {
    try {
      const account = event.data.object as Stripe.Account;

      // Find user by Stripe Connected Account ID
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeConnectedAccountId, account.id))
        .limit(1);

      if (!user) {
        logger.info('User not found for account webhook:', account.id);
        return;
      }

      switch (event.type) {
        case 'account.updated':
          // Check if account is now verified and can receive payouts
          const canReceivePayouts = account.payouts_enabled && account.charges_enabled;

          if (canReceivePayouts && account.details_submitted) {
            // Send success notification
            await db.insert(notifications).values({
              userId: user.id,
              type: 'account',
              title: 'Bank Account Connected!',
              message: `Your bank account has been successfully connected. You can now receive instant payouts when you sell beats.`,
              metadata: {
                accountId: account.id,
                payoutsEnabled: account.payouts_enabled,
                chargesEnabled: account.charges_enabled,
              },
            });
          } else if (!account.details_submitted) {
            // Remind user to complete onboarding
            await db.insert(notifications).values({
              userId: user.id,
              type: 'account',
              title: 'Complete Bank Account Setup',
              message: `Please complete your bank account setup to receive payouts from your sales.`,
              metadata: {
                accountId: account.id,
                action: 'complete_onboarding',
              },
            });
          }
          break;

        case 'account.application.deauthorized':
          // User has disconnected their account
          await db
            .update(users)
            .set({
              stripeConnectedAccountId: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          await db.insert(notifications).values({
            userId: user.id,
            type: 'account',
            title: 'Bank Account Disconnected',
            message: `Your bank account has been disconnected. You will not be able to receive payouts until you reconnect it.`,
            metadata: {
              accountId: account.id,
            },
          });
          break;
      }
    } catch (error: unknown) {
      logger.error('Error handling account webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe payout webhook events (for manual withdrawals)
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
        logger.info('Payout record not found for webhook:', payout.id);
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
            title: 'Withdrawal Completed',
            message: `Your withdrawal of $${Number(payoutRecord.amount).toFixed(2)} has been completed and is on its way to your bank account.`,
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
            title: 'Withdrawal Failed',
            message: `Your withdrawal failed: ${failureReason}. The amount has been returned to your available balance.`,
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
    } catch (error: unknown) {
      logger.error('Error handling payout webhook:', error);
      throw error;
    }
  }
}

export const instantPayoutService = new InstantPayoutService();
