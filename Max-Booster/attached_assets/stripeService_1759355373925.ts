import Stripe from "stripe";
import { storage } from "../storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export class StripeService {
  async getOrCreateSubscription(userId: string, tier: 'monthly' | 'yearly' | 'lifetime') {
    try {
      let user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.stripeSubscriptionId && tier !== 'lifetime') {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        return {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
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
  
        return {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
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
    // In production, these would be actual Stripe price IDs
    const priceIds = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
      yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
      lifetime: process.env.STRIPE_LIFETIME_PRICE_ID || 'price_lifetime'
    };

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

    if (tier === 'lifetime') {
      // Update user subscription tier
      await storage.updateUserSubscription(userId!, 'lifetime');
    } else if (beatId && buyerId && licenseType) {
      // Handle beat purchase
      const beat = await storage.getBeat(beatId);
      if (beat) {
        await storage.createBeatSale({
          beatId,
          buyerId: buyerId,
          sellerId: beat.userId,
          licenseType: licenseType as 'standard' | 'exclusive',
          price: (paymentIntent.amount / 100).toString(),
          stripePaymentIntentId: paymentIntent.id
        });
      }
    }
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice) {
    if (invoice.customer && invoice.subscription) {
      const customerId = invoice.customer as string;
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (user) {
        // Update subscription status
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const tier = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        await storage.updateUserSubscription(user.id, tier);
      }
    }
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
    if (user) {
      await storage.updateUserSubscription(user.id, null);
    }
  }
}

export const stripeService = new StripeService();
