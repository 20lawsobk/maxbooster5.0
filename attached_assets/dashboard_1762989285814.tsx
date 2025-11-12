import { MobileLayout } from "@/components/layout/mobile-layout";
import { ContentEditor } from "@/components/content/content-editor";
import { PreviewPanel } from "@/components/content/preview-panel";
import { ContentEditorSkeleton } from "@/components/ui/skeleton";
import { useState, Suspense } from "react";
import type { Content } from "@shared/schema";

export default function Dashboard() {
  const [currentContent, setCurrentContent] = useState<Partial<Content>>({
    title: "",
    body: "",
    contentType: "social_post",
    status: "draft",
    hashtags: [],
    selectedPlatforms: [],
  });

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full">
        <div className="flex-1 min-h-0">
          <Suspense fallback={<ContentEditorSkeleton />}>
            <ContentEditor 
              content={currentContent} 
              onContentChange={setCurrentContent}
            />
          </Suspense>
        </div>
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <PreviewPanel content={currentContent} />
        </div>
      </div>
    </MobileLayout>
  );
}
