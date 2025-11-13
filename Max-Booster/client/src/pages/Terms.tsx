import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 prose dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing and using Max Booster ("the Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="mb-4">
                Max Booster grants you a personal, non-transferable, non-exclusive license to use the Service subject to these Terms. This license includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access to the AI-powered music creation and distribution platform</li>
                <li>Use of the proprietary AI tools for music analysis and enhancement</li>
                <li>Distribution services to major streaming platforms</li>
                <li>Analytics and royalty tracking features</li>
                <li>Social media automation tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="mb-4">
                When you create an account with Max Booster, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying Max Booster immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
              <p className="mb-4">
                The Service and its original content (excluding user-generated content), features, and functionality are owned by Max Booster and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Your music and content remain yours. By using Max Booster's distribution services, you grant Max Booster a limited license to distribute your content to the platforms you select.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Payment and Subscription</h2>
              <p className="mb-4">
                Max Booster operates on a subscription model:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Monthly Plan:</strong> $49/month - Billed monthly, cancel anytime</li>
                <li><strong>Yearly Plan:</strong> $468/year - Billed annually, save 20%</li>
                <li><strong>Lifetime Plan:</strong> $699 one-time - Unlimited access forever</li>
              </ul>
              <p className="mt-4">
                All payments are processed securely through Stripe. By subscribing, you authorize Max Booster to charge your payment method on a recurring basis until you cancel.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. 90-Day Money-Back Guarantee</h2>
              <p className="mb-4">
                We stand behind Max Booster with a simple promise: if you're not satisfied within 90 days of your purchase, we'll refund your money—no questions asked.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">How the Guarantee Works:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>90 Days to Decide:</strong> You have a full 90 days from your purchase date to request a refund</li>
                <li><strong>All Plans Covered:</strong> Monthly, Yearly, and Lifetime subscriptions all qualify</li>
                <li><strong>Simple Process:</strong> Email support@maxbooster.ai with "Refund Request" and your account email</li>
                <li><strong>Fast Processing:</strong> Refunds are processed within 5-7 business days to your original payment method</li>
                <li><strong>No Questions Asked:</strong> We won't hassle you or ask for lengthy explanations</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">What Happens After a Refund:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your subscription will be immediately canceled</li>
                <li>Access to Max Booster features will end when the refund is processed</li>
                <li>Your account data is kept for 30 days in case you change your mind and want to return</li>
                <li>Any music you distributed remains on streaming platforms (we don't pull your releases)</li>
                <li>Beat marketplace earnings you've already withdrawn are yours to keep</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>One Refund Per Customer:</strong> The 90-day guarantee applies once per customer (prevents abuse)</li>
                <li><strong>Marketplace Earnings:</strong> Money you've earned selling beats is separate from your subscription and won't be refunded</li>
                <li><strong>After 90 Days:</strong> After the 90-day window, subscriptions are non-refundable (but you can cancel anytime)</li>
                <li><strong>Chargebacks:</strong> Please request a refund before filing a chargeback—chargebacks result in permanent account closure</li>
              </ul>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm">
                  <strong>Our Philosophy:</strong> We built Max Booster to help musicians succeed. If it's not working for you, we'd rather give you your money back than keep it. Simple as that.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cancellation Policy</h2>
              <p className="mb-4">
                You can cancel your Max Booster subscription at any time:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>How to Cancel:</strong> Go to Settings → Billing → Cancel Subscription, or email support@maxbooster.ai</li>
                <li><strong>Monthly Plans:</strong> You keep access until the end of your current billing period, then no further charges</li>
                <li><strong>Yearly Plans:</strong> Access continues until your annual period ends, no partial refunds (unless within 90-day guarantee window)</li>
                <li><strong>Lifetime Plans:</strong> Cannot be canceled (they're lifetime), but qualify for refund within 90 days of purchase</li>
                <li><strong>No Penalties:</strong> No cancellation fees or hidden charges—just straightforward cancellation</li>
              </ul>
              <p className="mt-4">
                After cancellation, you can still log in to download your projects and export your data for 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Royalties and Earnings</h2>
              <p className="mb-4">
                For music distributed through Max Booster (launching December 2025):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You retain 100% of your royalties from streaming platforms</li>
                <li>Max Booster does not take any percentage of your streaming earnings</li>
                <li>Payments are processed according to platform payout schedules (typically 30-90 days)</li>
                <li>You are responsible for reporting and paying taxes on your earnings</li>
                <li>Marketplace earnings (beat sales) are subject to a 10% platform fee for payment processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Prohibited Uses</h2>
              <p className="mb-4">
                You may not use the Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To distribute content you don't have rights to</li>
                <li>To upload copyrighted material without authorization</li>
                <li>To manipulate streaming numbers or engage in fraud</li>
                <li>To spam or send unsolicited commercial communications</li>
                <li>To interfere with or disrupt the Service or servers</li>
                <li>To attempt to gain unauthorized access to any portion of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Content Guidelines</h2>
              <p className="mb-4">
                All content must comply with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Copyright laws and intellectual property rights</li>
                <li>Platform-specific content policies</li>
                <li>Applicable laws regarding hate speech, violence, and illegal content</li>
                <li>Industry standards for music distribution</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p>
                Max Booster may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
              <p>
                In no event shall Max Booster, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Disclaimer</h2>
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Max Booster makes no warranties, expressed or implied, regarding the Service, including implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Changes to Terms</h2>
              <p>
                Max Booster reserves the right to modify or replace these Terms at any time. Notice of any material changes will be provided by posting the new Terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> support@maxbooster.ai</li>
                <li><strong>Address:</strong> Max Booster Inc., United States</li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                By using Max Booster, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
