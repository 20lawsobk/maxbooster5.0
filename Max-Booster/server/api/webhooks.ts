import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { releases, webhookEvents, webhookAttempts } from '@shared/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../logger.js';

const router = Router();

/**
 * Verify LabelGrid webhook signature
 */
function verifyLabelGridSignature(payload: string, signature: string): boolean {
  const secret = process.env.LABELGRID_WEBHOOK_SECRET || '';
  if (!secret) {
    logger.warn('LabelGrid webhook secret not configured');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * LabelGrid webhook endpoint for distribution status updates
 */
router.post('/labelgrid', async (req, res) => {
  try {
    const signature = req.headers['x-labelgrid-signature'] as string;
    const eventId = req.headers['x-labelgrid-event-id'] as string;
    const timestamp = req.headers['x-labelgrid-timestamp'] as string;
    
    // Log webhook attempt
    await db.insert(webhookAttempts).values({
      provider: 'labelgrid',
      eventId,
      timestamp: new Date(parseInt(timestamp) * 1000),
      payload: req.body,
      headers: req.headers as any,
      status: 'processing'
    });
    
    // Verify signature
    if (!verifyLabelGridSignature(JSON.stringify(req.body), signature)) {
      logger.error('Invalid LabelGrid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { event, data } = req.body;
    
    // Process different event types
    switch (event) {
      case 'release.submitted':
        await handleReleaseSubmitted(data);
        break;
        
      case 'release.approved':
        await handleReleaseApproved(data);
        break;
        
      case 'release.rejected':
        await handleReleaseRejected(data);
        break;
        
      case 'release.live':
        await handleReleaseLive(data);
        break;
        
      case 'release.takedown':
        await handleReleaseTakedown(data);
        break;
        
      case 'royalty.payment':
        await handleRoyaltyPayment(data);
        break;
        
      case 'analytics.update':
        await handleAnalyticsUpdate(data);
        break;
        
      default:
        logger.warn(`Unknown LabelGrid webhook event: ${event}`);
    }
    
    // Store webhook event for audit
    await db.insert(webhookEvents).values({
      provider: 'labelgrid',
      eventType: event,
      eventId,
      payload: data,
      processedAt: new Date()
    });
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    logger.error('LabelGrid webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle release submitted event
 */
async function handleReleaseSubmitted(data: any) {
  const { releaseId, status, submittedAt } = data;
  
  await db.update(releases)
    .set({
      status: 'submitted',
      metadata: {
        labelGridStatus: status,
        submittedAt: new Date(submittedAt),
        lastWebhookUpdate: new Date()
      }
    })
    .where(eq(releases.id, releaseId));
  
  logger.info(`Release ${releaseId} submitted to LabelGrid`);
}

/**
 * Handle release approved event
 */
async function handleReleaseApproved(data: any) {
  const { releaseId, approvedAt, platforms } = data;
  
  await db.update(releases)
    .set({
      status: 'approved',
      metadata: {
        labelGridStatus: 'approved',
        approvedAt: new Date(approvedAt),
        approvedPlatforms: platforms,
        lastWebhookUpdate: new Date()
      }
    })
    .where(eq(releases.id, releaseId));
  
  logger.info(`Release ${releaseId} approved for distribution`);
}

/**
 * Handle release rejected event
 */
async function handleReleaseRejected(data: any) {
  const { releaseId, reason, rejectedAt } = data;
  
  await db.update(releases)
    .set({
      status: 'rejected',
      metadata: {
        labelGridStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(rejectedAt),
        lastWebhookUpdate: new Date()
      }
    })
    .where(eq(releases.id, releaseId));
  
  logger.warn(`Release ${releaseId} rejected: ${reason}`);
}

/**
 * Handle release going live
 */
async function handleReleaseLive(data: any) {
  const { releaseId, platforms, liveAt, urls } = data;
  
  await db.update(releases)
    .set({
      status: 'live',
      metadata: {
        labelGridStatus: 'live',
        livePlatforms: platforms,
        platformUrls: urls,
        liveAt: new Date(liveAt),
        lastWebhookUpdate: new Date()
      }
    })
    .where(eq(releases.id, releaseId));
  
  logger.info(`Release ${releaseId} is now live on ${platforms.length} platforms`);
}

/**
 * Handle release takedown
 */
async function handleReleaseTakedown(data: any) {
  const { releaseId, reason, removedAt } = data;
  
  await db.update(releases)
    .set({
      status: 'removed',
      metadata: {
        labelGridStatus: 'removed',
        takedownReason: reason,
        removedAt: new Date(removedAt),
        lastWebhookUpdate: new Date()
      }
    })
    .where(eq(releases.id, releaseId));
  
  logger.info(`Release ${releaseId} taken down: ${reason}`);
}

/**
 * Handle royalty payment notification
 */
async function handleRoyaltyPayment(data: any) {
  const { releaseId, amount, period, currency, breakdown } = data;
  
  // Update release with latest royalty info
  const [release] = await db.select().from(releases)
    .where(eq(releases.id, releaseId));
  
  if (release) {
    const metadata = release.metadata as any || {};
    const royaltyHistory = metadata.royaltyHistory || [];
    
    royaltyHistory.push({
      amount,
      period,
      currency,
      breakdown,
      receivedAt: new Date()
    });
    
    await db.update(releases)
      .set({
        metadata: {
          ...metadata,
          royaltyHistory,
          totalRoyalties: (metadata.totalRoyalties || 0) + amount,
          lastRoyaltyUpdate: new Date()
        }
      })
      .where(eq(releases.id, releaseId));
    
    logger.info(`Royalty payment received for release ${releaseId}: ${amount} ${currency}`);
  }
}

/**
 * Handle analytics update
 */
async function handleAnalyticsUpdate(data: any) {
  const { releaseId, streams, downloads, revenue, period, platformBreakdown } = data;
  
  // Update release with latest analytics
  const [release] = await db.select().from(releases)
    .where(eq(releases.id, releaseId));
  
  if (release) {
    const metadata = release.metadata as any || {};
    
    await db.update(releases)
      .set({
        metadata: {
          ...metadata,
          analytics: {
            totalStreams: (metadata.analytics?.totalStreams || 0) + streams,
            totalDownloads: (metadata.analytics?.totalDownloads || 0) + downloads,
            totalRevenue: (metadata.analytics?.totalRevenue || 0) + revenue,
            lastPeriod: period,
            platformBreakdown,
            lastUpdate: new Date()
          }
        }
      })
      .where(eq(releases.id, releaseId));
    
    logger.info(`Analytics updated for release ${releaseId}: ${streams} streams, ${revenue} revenue`);
  }
}

/**
 * Stripe webhook endpoint
 */
router.post('/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      logger.warn('Stripe webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }
    
    // Verify Stripe webhook signature
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful subscription
        logger.info('Stripe checkout completed:', event.data.object);
        break;
        
      case 'customer.subscription.updated':
        // Handle subscription updates
        logger.info('Stripe subscription updated:', event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        logger.info('Stripe subscription cancelled:', event.data.object);
        break;
        
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;