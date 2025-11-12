import { MobileLayout } from "@/components/layout/mobile-layout";
import { AutonomousDashboard } from "@/components/autonomous/autonomous-dashboard";

export default function Autonomous() {
  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Autonomous Social Media</h1>
            <p className="text-muted-foreground mt-2">
              Set it once and let AI handle everything - completely autonomous content creation, optimization, and publishing
            </p>
          </div>
          <AutonomousDashboard />
        </div>
      </div>
    </MobileLayout>
  );
}