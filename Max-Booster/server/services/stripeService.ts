import Stripe from "stripe";
import { storage } from "../storage";
import { getStripePriceIds } from "./stripeSetup.js";

// Support both production and testing Stripe keys (same logic as routes.ts)
let actualStripeKey: string | undefined;
if (process.env.NODE_ENV === 'production') {
  // Production: Only use STRIPE_SECRET_KEY
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
    actualStripeKey = process.env.STRIPE_SECRET_KEY;
  }
} else {
  // Development: Try TESTING_STRIPE_SECRET_KEY first, then STRIPE_SECRET_KEY
  if (process.env.TESTING_STRIPE_SECRET_KEY?.startsWith('sk_')) {
    actualStripeKey = process.env.TESTING_STRIPE_SECRET_KEY;
  } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
    actualStripeKey = process.env.STRIPE_SECRET_KEY;
  }
}

if (!actualStripeKey) {
  console.error('❌ STRIPE CONFIGURATION ERROR in stripeService.ts:');
  console.error('   Missing or invalid Stripe secret key.');
  console.error('   Expected: STRIPE_SECRET_KEY (production) or TESTING_STRIPE_SECRET_KEY (development)');
  console.error('   Format: sk_test_... or sk_live_...');
  throw new Error('Invalid Stripe configuration - cannot initialize payment service');
}

const stripe = new Stripe(actualStripeKey, {
  apiVersion: "2025-08-27.basil",
});

export class StripeService {
  async getOrCreateSubscription(userId: string, tier: 'monthly' | 'yearly' | 'lifetime') {
    try {
      let user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.stripeSubscriptionId && tier !== 'lifetime') {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent']
        });
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
        const paymentIntent = latestInvoice ? (latestInvoice as any).payment_intent as Stripe.PaymentIntent | null : null;
        return {
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        };
      }
      
      if (!user.email) {
        throw new Error('No user email on file');
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId, null);
      }

      // Get price ID based on tier
      const priceId = this.getPriceId(tier);

      if (tier === 'lifetime') {
        // Create one-time payment for lifetime
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 69900, // $699.00
          currency: 'usd',
          customer: customerId,
          metadata: {
            userId,
            tier: 'lifetime'
          }
        });

        return {
          clientSecret: paymentIntent.client_secret,
          tier: 'lifetime'
        };
      } else {
        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(userId, customerId, subscription.id);
  
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
        const paymentIntent = latestInvoice ? (latestInvoice as any).payment_intent as Stripe.PaymentIntent | null : null;
        return {
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        };
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  async createBeatPurchaseIntent(beatId: string, buyerId: string, licenseType: 'standard' | 'exclusive', price: number) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          beatId,
          buyerId,
          licenseType
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Beat purchase intent error:', error);
      throw error;
    }
  }

  private getPriceId(tier: 'monthly' | 'yearly' | 'lifetime'): string {
    // Get actual Stripe price IDs created during server initialization
    const priceIds = getStripePriceIds();
    return priceIds[tier];
  }

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentSuccess(paymentIntent);
          break;
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleSubscriptionPayment(invoice);
          break;
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionCanceled(subscription);
          break;
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { userId, tier, beatId, buyerId, licenseType } = paymentIntent.metadata;

    if (tier === 'lifetime' && userId) {
      // Update user subscription status
      await storage.updateUser(userId, { 
        subscriptionPlan: 'lifetime',
        subscriptionStatus: 'active'
      });
    } else if (beatId && buyerId && licenseType) {
      // Beat purchase handling - would need beat marketplace storage methods
      console.log('Beat purchase completed:', { beatId, buyerId, licenseType });
      // TODO: Implement beat sale storage when marketplace is active
    }
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice) {
    const invoiceSubscription = (invoice as any).subscription;
    if (invoice.customer && invoiceSubscription) {
      const customerId = invoice.customer as string;
      const subscriptionId = typeof invoiceSubscription === 'string' ? invoiceSubscription : invoiceSubscription.id;
      
      // Find user by Stripe customer ID
      const users = await storage.getAllUsers();
      const user = users.find(u => u.stripeCustomerId === customerId);
      
      if (user && subscriptionId) {
        // Update subscription status
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        await storage.updateUser(user.id, {
          subscriptionPlan: tier,
          subscriptionStatus: subscription.status
        });
      }
    }
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const users = await storage.getAllUsers();
    const user = users.find(u => u.stripeCustomerId === customerId);
    
    if (user) {
      await storage.updateUser(user.id, {
        subscriptionStatus: 'canceled'
      });
    }
  }
}

export const stripeService = new StripeService();
