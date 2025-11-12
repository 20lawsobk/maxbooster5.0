import { MobileLayout } from "@/components/layout/mobile-layout";
import { ContentEditor } from "@/components/content/content-editor";
import { PreviewPanel } from "@/components/content/preview-panel";
import { ContentEditorSkeleton } from "@/components/ui/skeleton";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Content } from "@shared/schema";

interface ContentEditorPageProps {
  params?: { id?: string };
}

export default function ContentEditorPage({ params }: ContentEditorPageProps) {
  const [, setLocation] = useLocation();
  const contentId = params?.id;
  const isEditing = !!contentId;

  // Default content structure for new content
  const [currentContent, setCurrentContent] = useState<Partial<Content>>({
    title: "",
    body: "",
    contentType: "social_post",
    status: "draft",
    hashtags: [],
    selectedPlatforms: [],
  });

  // Fetch existing content if editing
  const { data: existingContent, isLoading } = useQuery({
    queryKey: ["/api/content", contentId],
    queryFn: async () => {
      const response = await fetch(`/api/content/${contentId}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json();
    },
    enabled: isEditing,
  });

  // Update current content when existing content is loaded
  useEffect(() => {
    if (existingContent && isEditing) {
      setCurrentContent(existingContent);
    }
  }, [existingContent, isEditing]);

  if (isEditing && isLoading) {
    return (
      <MobileLayout>
        <div className="flex-1 min-h-0">
          <ContentEditorSkeleton />
        </div>
      </MobileLayout>
    );
  }

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