import { MobileLayout } from "@/components/layout/mobile-layout";
import { AutopilotDashboard } from "@/components/autopilot/autopilot-dashboard";

export default function Autopilot() {
  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Content Autopilot</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered automated content creation, optimization, and publishing system
            </p>
          </div>
          <AutopilotDashboard />
        </div>
      </div>
    </MobileLayout>
  );
}