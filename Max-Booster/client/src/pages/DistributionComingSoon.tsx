import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music2, 
  Globe, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle,
  Rocket
} from 'lucide-react';
import { SiSpotify, SiApple, SiYoutube, SiAmazon, SiTidal, SiSoundcloud } from 'react-icons/si';

export default function DistributionComingSoon() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-full">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            
            <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Launching December 2025
            </Badge>
            
            <h1 className="text-5xl font-bold text-white">
              Music Distribution
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Distribute your music to 34+ streaming platforms worldwide. 
              Keep 100% of your royalties with zero commission fees.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Global Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="mb-4">Deliver your music to all major platforms:</p>
                <div className="flex flex-wrap gap-3">
                  <SiSpotify className="w-8 h-8 text-green-500" />
                  <SiApple className="w-8 h-8 text-gray-400" />
                  <SiYoutube className="w-8 h-8 text-red-500" />
                  <SiAmazon className="w-8 h-8 text-orange-400" />
                  <SiTidal className="w-8 h-8 text-blue-400" />
                  <SiSoundcloud className="w-8 h-8 text-orange-500" />
                  <span className="text-sm text-gray-400 self-center">+ 28 more</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  100% Royalties
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Unlike competitors who take 15-30% commission, you keep every dollar you earn. Zero platform fees on royalties.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  Release Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Schedule releases in advance, set pre-save campaigns, and coordinate launches across all platforms simultaneously.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-pink-400" />
                  Real-Time Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Track streams, downloads, and earnings across all platforms with detailed geographic and demographic breakdowns.</p>
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
                  'Unlimited releases & tracks',
                  'ISRC & UPC code generation',
                  'Royalty split management',
                  'HyperFollow smart links',
                  'Pre-save campaigns',
                  'Territory management',
                  'Copyright protection',
                  'YouTube Content ID',
                  'Spotify for Artists integration',
                  'Apple Music for Artists',
                  'Release takedown tools',
                  'Priority distribution support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Coming Q1 2026
                  </h3>
                  <p className="text-gray-300">
                    We're finalizing partnerships with distribution networks to bring you the best rates and fastest delivery times in the industry.
                  </p>
                </div>
                <Music2 className="w-20 h-20 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Distribution will be included at no additional cost with your Max Booster subscription
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
