import { MobileLayout } from "@/components/layout/mobile-layout";
import { CalendarSkeleton } from "@/components/ui/loading-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import type { Content } from "@shared/schema";

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { data: content = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  const scheduledContent = content.filter(c => c.status === "scheduled");

  const handleCreateContent = () => {
    setLocation("/content/new");
  };

  const handleEditContent = (contentId: string) => {
    setLocation(`/content/edit/${contentId}`);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Content Calendar</h1>
            </div>
            <CalendarSkeleton />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <Button onClick={handleCreateContent} data-testid="button-create-content">
              <Edit className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          </div>

          {scheduledContent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No scheduled content</h3>
                <p className="text-muted-foreground">
                  Schedule some content to see it appear in your calendar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scheduledContent.map((item) => (
                <Card key={item.id} className="content-card" data-testid={`content-card-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title || "Untitled Content"}</CardTitle>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {item.scheduledAt ? format(new Date(item.scheduledAt), "PPP 'at' p") : "Not scheduled"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.body}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.selectedPlatforms?.map(platform => (
                          <span 
                            key={platform}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditContent(item.id!)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
