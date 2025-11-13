import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Brain, Sparkles, TrendingUp, AlertTriangle, ArrowLeft } from "lucide-react";

export default function AIDashboardComingSoon() {
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
                  <Brain className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-4">
              AI Analytics & Predictions
            </CardTitle>
            <CardDescription className="text-xl">
              Coming Soon to Max Booster
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Churn Prediction with ML Models</h3>
                  <p className="text-muted-foreground">
                    Advanced machine learning algorithms will predict which users are at risk of churning, allowing you to take proactive retention actions before it's too late.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Revenue Forecasting with Time-Series Analysis</h3>
                  <p className="text-muted-foreground">
                    Predict future revenue streams with high accuracy using time-series models trained on your historical data. Plan better with confidence intervals and scenario analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Anomaly Detection Powered by AI</h3>
                  <p className="text-muted-foreground">
                    Real-time anomaly detection across all your metrics - streaming patterns, engagement drops, or revenue spikes. Get instant alerts when something unusual happens.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Predictive Insights for User Behavior</h3>
                  <p className="text-muted-foreground">
                    Understand what your users will do next with AI-powered behavioral predictions. Optimize your content strategy and release timing for maximum impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t">
              <p className="text-lg font-medium mb-2">We're Training AI Models on Your Platform Data</p>
              <p className="text-muted-foreground">
                Our data science team is building and training custom ML models to provide you with accurate, actionable predictions tailored to the music industry.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Expected Launch: <span className="font-semibold text-primary">Q2 2026</span>
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
                onClick={() => setLocation('/analytics')}
              >
                View Basic Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            In the meantime, check out{" "}
            <button
              onClick={() => setLocation('/analytics')}
              className="text-primary hover:underline font-medium"
            >
              Basic Analytics
            </button>
            , create music in the{" "}
            <button
              onClick={() => setLocation('/studio')}
              className="text-primary hover:underline font-medium"
            >
              Studio
            </button>
            , or manage your{" "}
            <button
              onClick={() => setLocation('/social-media')}
              className="text-primary hover:underline font-medium"
            >
              Social Media
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
