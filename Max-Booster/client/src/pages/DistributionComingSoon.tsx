import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Music, Sparkles, Calendar, ArrowLeft } from "lucide-react";

export default function DistributionComingSoon() {
  useRequireAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/dashboard')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Main Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-6 rounded-full">
                  <Music className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-4">
              Music Distribution
            </CardTitle>
            <CardDescription className="text-xl">
              Coming Soon to Max Booster
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Features Preview */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Distribute to 34+ Platforms</h3>
                  <p className="text-muted-foreground">
                    Get your music on Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, Deezer, and 28+ more streaming platforms worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Professional ISRC & UPC Codes</h3>
                  <p className="text-muted-foreground">
                    Automatic generation of industry-standard ISRC and UPC codes for all your releases. Keep 100% of your royalties.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Music className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-Time Analytics</h3>
                  <p className="text-muted-foreground">
                    Track your streaming numbers, earnings, and geographic performance across all platforms in one unified dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center pt-8 border-t">
              <p className="text-lg font-medium mb-2">We're Working Hard to Bring This to You!</p>
              <p className="text-muted-foreground">
                Our team is finalizing partnerships with distribution providers to ensure you get the best service possible.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Expected Launch: <span className="font-semibold text-primary">Q1 2026</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => setLocation('/dashboard')}
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation('/studio')}
              >
                Go to Studio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            In the meantime, you can create and produce music in the{" "}
            <button
              onClick={() => setLocation('/studio')}
              className="text-primary hover:underline font-medium"
            >
              Studio
            </button>
            , manage your{" "}
            <button
              onClick={() => setLocation('/social-media')}
              className="text-primary hover:underline font-medium"
            >
              Social Media
            </button>
            , and use our{" "}
            <button
              onClick={() => setLocation('/marketplace')}
              className="text-primary hover:underline font-medium"
            >
              Marketplace
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
