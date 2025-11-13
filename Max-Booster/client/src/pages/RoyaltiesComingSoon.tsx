import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  CheckCircle,
  Rocket,
  FileText,
  CreditCard
} from 'lucide-react';

export default function RoyaltiesComingSoon() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-full">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Launching December 2025
            </Badge>
            
            <h1 className="text-5xl font-bold text-white">
              Royalty Management
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track earnings, manage splits, and get paid faster with automated royalty processing 
              and transparent reporting across all platforms.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  Instant Payouts
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Get paid as soon as earnings are available. No more waiting 2-3 months for traditional distribution cycles.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                  Automated Splits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Set up royalty splits for collaborators once, and payments distribute automatically. No manual calculations needed.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                  Revenue Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>AI-powered predictions help you plan ahead with accurate monthly revenue forecasts based on streaming trends.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText className="w-5 h-5 mr-2 text-orange-400" />
                  Tax Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Automatic tax form generation (1099, W-9) and detailed earnings reports make tax season painless.</p>
              </CardContent>
            </Card>
          </div>

          {/* What's Included */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Real-time earnings tracking',
                  'Platform-by-platform breakdown',
                  'Geographic revenue reports',
                  'Automatic collaborator splits',
                  'Recoupment management',
                  'Monthly statements',
                  'Payment method flexibility',
                  'Tax form automation',
                  'Historical earnings data',
                  'Revenue trend analysis',
                  'Export to CSV/Excel',
                  'Multi-currency support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Features */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-5 h-5 mr-2 text-pink-400" />
                Collaboration Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Work with producers, songwriters, and featured artists seamlessly:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Invite collaborators by email</p>
                    <p className="text-sm text-gray-400">They accept splits and receive payments automatically</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Flexible split percentages</p>
                    <p className="text-sm text-gray-400">Different rates for different roles (songwriter, producer, performer)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Recoupment tracking</p>
                    <p className="text-sm text-gray-400">Manage advance payments and track when they're paid back</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Coming Q1 2026
                  </h3>
                  <p className="text-gray-300">
                    Launching alongside our distribution feature with instant payout capabilities and full transparency across all revenue streams.
                  </p>
                </div>
                <CreditCard className="w-20 h-20 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Royalty management will be included at no additional cost with your Max Booster subscription
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
