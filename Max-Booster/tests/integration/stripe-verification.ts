import { logger } from '../../server/logger.js';
import Stripe from 'stripe';

interface StripeVerificationResult {
  configured: boolean;
  mode: 'test' | 'live' | 'invalid';
  verified: boolean;
  capabilities: {
    createCustomer: boolean;
    createPaymentIntent: boolean;
    listProducts: boolean;
    webhookEndpoint: boolean;
  };
  error?: string;
}

class StripeVerificationService {
  private stripe: Stripe | null = null;

  async verify(): Promise<StripeVerificationResult> {
    logger.info('🔍 Verifying Stripe integration...\n');

    const result: StripeVerificationResult = {
      configured: false,
      mode: 'invalid',
      verified: false,
      capabilities: {
        createCustomer: false,
        createPaymentIntent: false,
        listProducts: false,
        webhookEndpoint: false,
      },
    };

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      result.error = 'STRIPE_SECRET_KEY not configured or invalid format';
      this.printReport(result);
      return result;
    }

    result.configured = true;
    result.mode = stripeKey.startsWith('sk_live_') ? 'live' : 'test';

    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    await this.testCapabilities(result);

    this.printReport(result);

    return result;
  }

  private async testCapabilities(result: StripeVerificationResult): Promise<void> {
    if (!this.stripe) return;

    try {
      logger.info('Testing: Create customer capability...');
      const customer = await this.stripe.customers.create({
        email: `test-${Date.now()}@maxbooster-verification.com`,
        metadata: { test: 'verification' },
      });

      if (customer.id) {
        result.capabilities.createCustomer = true;
        logger.info('   ✅ PASS - Customer created:', customer.id);

        await this.stripe.customers.del(customer.id);
        logger.info('   🧹 Cleanup - Test customer deleted\n');
      }
    } catch (error) {
      logger.error('   ❌ FAIL:', error instanceof Error ? error.message : 'Unknown error');
      result.error = `Customer creation failed: ${error instanceof Error ? error.message : 'Unknown'}`;
    }

    try {
      logger.info('Testing: Payment Intent capability...');
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 100,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      if (paymentIntent.id) {
        result.capabilities.createPaymentIntent = true;
        logger.info('   ✅ PASS - Payment Intent created:', paymentIntent.id);

        await this.stripe.paymentIntents.cancel(paymentIntent.id);
        logger.info('   🧹 Cleanup - Test payment intent cancelled\n');
      }
    } catch (error) {
      logger.error('   ❌ FAIL:', error instanceof Error ? error.message : 'Unknown error');
    }

    try {
      logger.info('Testing: List products capability...');
      const products = await this.stripe.products.list({ limit: 1 });

      result.capabilities.listProducts = true;
      logger.info(`   ✅ PASS - Retrieved ${products.data.length} product(s)\n`);
    } catch (error) {
      logger.error('   ❌ FAIL:', error instanceof Error ? error.message : 'Unknown error');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      result.capabilities.webhookEndpoint = true;
      logger.info('Testing: Webhook configuration...');
      logger.info('   ✅ PASS - STRIPE_WEBHOOK_SECRET configured\n');
    } else {
      logger.warn('   ⚠️  WARNING - STRIPE_WEBHOOK_SECRET not configured\n');
    }

    result.verified =
      result.capabilities.createCustomer &&
      result.capabilities.createPaymentIntent &&
      result.capabilities.listProducts;
  }

  private printReport(result: StripeVerificationResult): void {
    console.log('\n' + '═'.repeat(70));
    console.log('             STRIPE INTEGRATION VERIFICATION');
    console.log('═'.repeat(70) + '\n');

    console.log(`Configuration:     ${result.configured ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`Mode:              ${result.mode.toUpperCase()}`);
    console.log(`Verified:          ${result.verified ? '✅ Yes' : '❌ No'}\n`);

    console.log('Capabilities:');
    console.log(`  Create Customer:       ${result.capabilities.createCustomer ? '✅' : '❌'}`);
    console.log(`  Create Payment:        ${result.capabilities.createPaymentIntent ? '✅' : '❌'}`);
    console.log(`  List Products:         ${result.capabilities.listProducts ? '✅' : '❌'}`);
    console.log(
      `  Webhook Endpoint:      ${result.capabilities.webhookEndpoint ? '✅' : '⚠️  (Optional)'}\n`
    );

    if (result.error) {
      console.log('Error:', result.error, '\n');
    }

    console.log('═'.repeat(70));

    if (result.verified) {
      console.log('                ✅ STRIPE: VERIFIED');
      console.log('');
      console.log('  Stripe payment processing is operational.');
      if (result.mode === 'test') {
        console.log('  ⚠️  Note: Running in TEST mode. Use live keys for production.');
      } else {
        console.log('  ✅ Running in LIVE mode - production ready.');
      }
    } else {
      console.log('                ❌ STRIPE: VERIFICATION FAILED');
      console.log('');
      console.log('  Payment processing will not work.');
      console.log('  Fix configuration before deploying.');
    }

    console.log('═'.repeat(70) + '\n');
  }
}

const verifier = new StripeVerificationService();
verifier
  .verify()
  .then((result) => {
    process.exit(result.verified ? 0 : 1);
  })
  .catch((error) => {
    logger.error('Stripe verification failed:', error);
    process.exit(1);
  });
