import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { DollarSign, Sparkles, Users, ArrowLeft } from "lucide-react";

export default function RoyaltiesComingSoon() {
  useRequireAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Button
          variant="ghost"
          onClick={() => setLocation('/dashboard')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-6 rounded-full">
                  <DollarSign className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-4">
              Royalty Splits & Payouts
            </CardTitle>
            <CardDescription className="text-xl">
              Coming Soon to Max Booster
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Automated Split Management</h3>
                  <p className="text-muted-foreground">
                    Set up royalty splits with collaborators and automatically distribute earnings from every sale and stream. No manual calculations needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Instant Payouts</h3>
                  <p className="text-muted-foreground">
                    Get paid the same day your music earns. No more waiting 45-90 days for royalties - receive your money within 24 hours via Stripe Connect.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Transparent Statements</h3>
                  <p className="text-muted-foreground">
                    View detailed earnings breakdowns by platform, track, territory, and time period. Export professional royalty statements for accounting.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t">
              <p className="text-lg font-medium mb-2">Integration in Progress</p>
              <p className="text-muted-foreground">
                Our team is finalizing partnerships with streaming platforms and payment providers to bring you the most reliable royalty tracking and fastest payouts in the industry.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Expected Launch: <span className="font-semibold text-primary">Q1 2026</span>
              </p>
            </div>

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
                onClick={() => setLocation('/marketplace')}
              >
                Browse Marketplace
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            While we finalize royalty features, you can create music in the{" "}
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
            , and sell beats on the{" "}
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
