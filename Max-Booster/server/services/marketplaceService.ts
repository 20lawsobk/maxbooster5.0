import { storage } from "../storage";
import { db } from "../db";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { type Order as DBOrder } from "@shared/schema";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

export interface BeatListing {
  id: string;
  userId: string;
  title: string;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  price: number;
  audioUrl: string;
  artworkUrl?: string;
  tags?: string[];
  licenses: BeatLicense[];
  status: 'draft' | 'active' | 'sold' | 'inactive';
  createdAt: Date;
}

export interface BeatLicense {
  type: 'basic' | 'premium' | 'exclusive';
  price: number;
  features: string[];
}

// Service-layer Order type (domain model)
export interface Order {
  id: string;
  beatId: string;  // Maps to listingId in database
  buyerId: string;
  sellerId: string;
  licenseType: string;
  amount: number;  // Maps to amountCents / 100 in database
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;  // Maps to stripePaymentIntentId in database
  licenseDocumentUrl?: string;
  createdAt: Date;
}

// Helper functions to map between service and database Order types
function toServiceOrder(dbOrder: DBOrder): Order {
  return {
    id: dbOrder.id,
    beatId: dbOrder.listingId || '',
    buyerId: dbOrder.buyerId || '',
    sellerId: dbOrder.sellerId || '',
    licenseType: dbOrder.licenseType || '',
    amount: (dbOrder.amountCents || 0) / 100,
    status: dbOrder.status as Order['status'],
    paymentIntentId: dbOrder.stripePaymentIntentId || undefined,
    licenseDocumentUrl: dbOrder.licenseDocumentUrl || undefined,
    createdAt: dbOrder.createdAt || new Date(),
  };
}

function toDBOrder(serviceOrder: Partial<Order>): Partial<DBOrder> {
  const dbOrder: Partial<DBOrder> = {};
  
  if (serviceOrder.id) dbOrder.id = serviceOrder.id;
  if (serviceOrder.beatId) dbOrder.listingId = serviceOrder.beatId;
  if (serviceOrder.buyerId) dbOrder.buyerId = serviceOrder.buyerId;
  if (serviceOrder.sellerId) dbOrder.sellerId = serviceOrder.sellerId;
  if (serviceOrder.licenseType) dbOrder.licenseType = serviceOrder.licenseType;
  if (serviceOrder.amount !== undefined) dbOrder.amountCents = Math.round(serviceOrder.amount * 100);
  if (serviceOrder.status) dbOrder.status = serviceOrder.status;
  if (serviceOrder.paymentIntentId) dbOrder.stripePaymentIntentId = serviceOrder.paymentIntentId;
  if (serviceOrder.licenseDocumentUrl) dbOrder.licenseDocumentUrl = serviceOrder.licenseDocumentUrl;
  
  return dbOrder;
}

export class MarketplaceService {
  /**
   * Create a new beat listing
   */
  async createListing(data: {
    userId: string;
    title: string;
    description?: string;
    genre?: string;
    bpm?: number;
    key?: string;
    price: number;
    audioUrl: string;
    artworkUrl?: string;
    tags?: string[];
    licenses: BeatLicense[];
  }): Promise<BeatListing> {
    try {
      // In production, this would create a record in a beats table
      const listing: BeatListing = {
        id: nanoid(),
        ...data,
        status: 'active',
        createdAt: new Date(),
      };

      return listing;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw new Error("Failed to create beat listing");
    }
  }

  /**
   * Get listing details
   */
  async getListing(listingId: string): Promise<BeatListing | null> {
    try {
      const listing = await storage.getBeatListing(listingId);
      return listing;
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw new Error("Failed to fetch listing");
    }
  }

  /**
   * Browse marketplace listings with filters
   */
  async browseListings(filters: {
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    bpm?: number;
    key?: string;
    tags?: string[];
    sortBy?: 'recent' | 'popular' | 'price_low' | 'price_high';
    limit?: number;
    offset?: number;
  }): Promise<BeatListing[]> {
    try {
      const listings = await storage.getBeatListings(filters);
      return listings;
    } catch (error) {
      console.error("Error browsing listings:", error);
      throw new Error("Failed to browse listings");
    }
  }

  /**
   * Create an order for a beat purchase
   */
  async createOrder(data: {
    beatId: string;
    buyerId: string;
    licenseType: string;
  }): Promise<Order> {
    try {
      // Get beat details
      const beat = await this.getListing(data.beatId);
      if (!beat) {
        throw new Error("Beat not found");
      }

      // Find the license price
      const license = beat.licenses.find(l => l.type === data.licenseType);
      if (!license) {
        throw new Error("Invalid license type");
      }

      const order: Order = {
        id: `order_${nanoid()}`,
        beatId: data.beatId,
        buyerId: data.buyerId,
        sellerId: beat.userId,
        licenseType: data.licenseType,
        amount: license.price,
        status: 'pending',
        createdAt: new Date(),
      };

      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  }

  /**
   * Process payment for an order using Stripe
   */
  async processPayment(orderId: string, paymentIntentId: string): Promise<Order> {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      // Get existing order from database
      const dbOrder = await storage.getOrder(orderId);
      if (!dbOrder) {
        throw new Error("Order not found");
      }

      // Retrieve payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error("Payment not successful");
      }

      // Update order status to completed
      const updatedDBOrder = await storage.updateOrder(orderId, {
        status: 'completed',
        stripePaymentIntentId: paymentIntentId,
      });

      // Generate license document
      await this.generateLicense(orderId);

      // Distribute royalty splits if applicable
      await this.distributeSplits(orderId);

      // Convert database order to service order
      return toServiceOrder(updatedDBOrder);
    } catch (error) {
      console.error("Error processing payment:", error);
      throw new Error("Failed to process payment");
    }
  }

  /**
   * Distribute royalty splits to collaborators using Stripe Connect
   */
  async distributeSplits(orderId: string): Promise<{ success: boolean }> {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      // In production:
      // 1. Get order details and beat metadata
      // 2. Calculate split percentages for collaborators
      // 3. Use Stripe Connect transfers to distribute funds
      // 4. Record distribution in database

      return { success: true };
    } catch (error) {
      console.error("Error distributing splits:", error);
      throw new Error("Failed to distribute royalty splits");
    }
  }

  /**
   * Generate license document for completed purchase
   */
  async generateLicense(orderId: string): Promise<{ licenseUrl: string }> {
    try {
      // In production:
      // 1. Fetch order and beat details
      // 2. Generate PDF license document with terms
      // 3. Store in cloud storage (S3/R2)
      // 4. Return download URL

      const licenseUrl = `/licenses/${orderId}.pdf`;
      
      return { licenseUrl };
    } catch (error) {
      console.error("Error generating license:", error);
      throw new Error("Failed to generate license");
    }
  }

  /**
   * Create Stripe checkout session for beat purchase
   */
  async createCheckoutSession(data: {
    beatId: string;
    licenseType: string;
    buyerId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      const beat = await this.getListing(data.beatId);
      if (!beat) {
        throw new Error("Beat not found");
      }

      const license = beat.licenses.find(l => l.type === data.licenseType);
      if (!license) {
        throw new Error("Invalid license type");
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${beat.title} - ${license.type} License`,
                description: license.features.join(', '),
              },
              unit_amount: license.price * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          beatId: data.beatId,
          licenseType: data.licenseType,
          buyerId: data.buyerId,
        },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const dbOrders = await storage.getUserOrders(userId);
      return dbOrders.map(toServiceOrder);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch user orders");
    }
  }

  /**
   * Get user's sales (for sellers)
   */
  async getUserSales(userId: string): Promise<Order[]> {
    try {
      // Query orders where user is the seller
      const dbOrders = await storage.getOrders();
      const sellerOrders = dbOrders.filter(order => order.sellerId === userId);
      return sellerOrders.map(toServiceOrder);
    } catch (error) {
      console.error("Error fetching user sales:", error);
      throw new Error("Failed to fetch user sales");
    }
  }

  /**
   * Setup Stripe Connect for sellers
   */
  async setupStripeConnect(userId: string, returnUrl: string, refreshUrl: string): Promise<{ url: string }> {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      // Check if user already has a Connect account
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      let accountId = user.stripeCustomerId;

      if (!accountId) {
        // Create new Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
        });
        accountId = account.id;

        // Update user with account ID
        await storage.updateUser(userId, { stripeCustomerId: accountId });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (error) {
      console.error("Error setting up Stripe Connect:", error);
      throw new Error("Failed to setup Stripe Connect");
    }
  }
}

export const marketplaceService = new MarketplaceService();
