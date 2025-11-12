import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-2xl" data-testid="card-success">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" data-testid="icon-success" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-welcome">
            Welcome to Social Autopilot Pro!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400" data-testid="text-subscription-confirmed">
            Your subscription has been confirmed and you now have access to all Pro features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6" data-testid="section-next-steps">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🚀 What's next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3" data-testid="step-connect">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Connect your social media accounts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Link your Twitter, Instagram, LinkedIn, and other platforms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3" data-testid="step-create">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Create your first AI-powered content</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use our content editor to generate and optimize posts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3" data-testid="step-schedule">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Schedule your content</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set up your posting schedule for optimal engagement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6" data-testid="section-pro-features">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">✨ Pro features now available:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2" data-testid="feature-unlimited">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited content</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-ai">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">AI optimization</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-analytics">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Advanced analytics</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-testing">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">A/B testing</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-crisis">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Crisis detection</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="feature-support">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/dashboard'}
              data-testid="button-dashboard"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link href="/features">
              <Button variant="outline" className="flex-1" data-testid="button-explore">
                Explore Features
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t" data-testid="section-support">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Need help getting started?
            </p>
            <Link href="/features">
              <Button variant="link" className="text-blue-600 hover:text-blue-700" data-testid="button-help">
                View Documentation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}