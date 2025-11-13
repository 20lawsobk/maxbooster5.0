import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, Eye, Activity, FileCheck, ArrowLeft } from "lucide-react";

export default function SecurityDashboardComingSoon() {
  useRequireAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Button
          variant="ghost"
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-6 rounded-full">
                  <Shield className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-4">
              Advanced Security Monitoring
            </CardTitle>
            <CardDescription className="text-xl">
              Coming Soon to Max Booster
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Eye className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-Time Threat Detection</h3>
                  <p className="text-muted-foreground">
                    Monitor for suspicious activity, unauthorized access attempts, and potential security breaches in real-time. Get instant alerts when threats are detected.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Activity className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Behavioral Analysis</h3>
                  <p className="text-muted-foreground">
                    Advanced AI-powered behavioral analysis to identify abnormal user patterns, detect account takeovers, and prevent fraud before it impacts your platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <FileCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Penetration Testing Results</h3>
                  <p className="text-muted-foreground">
                    Regular automated and manual penetration testing reports with detailed vulnerability assessments, remediation steps, and compliance tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Security Metrics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Comprehensive security metrics including failed login attempts, API abuse patterns, DDoS protection status, and compliance scores - all in one unified view.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t">
              <p className="text-lg font-medium mb-2">We're Building Comprehensive Security Monitoring Infrastructure</p>
              <p className="text-muted-foreground">
                Our security team is implementing enterprise-grade monitoring tools, SIEM integration, and automated threat response systems to keep your platform secure.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Expected Launch: <span className="font-semibold text-primary">Q1 2026</span>
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => setLocation('/admin/dashboard')}
              >
                Return to Admin Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation('/settings')}
              >
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            While we build advanced security features, you can manage{" "}
            <button
              onClick={() => setLocation('/settings')}
              className="text-primary hover:underline font-medium"
            >
              Security Settings
            </button>
            , view{" "}
            <button
              onClick={() => setLocation('/admin/dashboard')}
              className="text-primary hover:underline font-medium"
            >
              Admin Dashboard
            </button>
            , or check{" "}
            <button
              onClick={() => setLocation('/admin/support')}
              className="text-primary hover:underline font-medium"
            >
              Support Tickets
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
