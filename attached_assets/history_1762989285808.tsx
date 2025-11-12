import { MobileLayout } from "@/components/layout/mobile-layout";
import { ContentListSkeleton } from "@/components/ui/loading-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, CheckCircle, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Content } from "@shared/schema";

export default function History() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: content = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/content/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Content History</h1>
            </div>
            <ContentListSkeleton />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Content History</h1>
          
          {content.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground">
                  Create your first piece of content to see it appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Card key={item.id} className="content-card" data-testid={`content-item-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(item.status)}
                          <CardTitle className="text-lg">
                            {item.title || "Untitled Content"}
                          </CardTitle>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created {item.createdAt ? format(new Date(item.createdAt), "PPP 'at' p") : "Unknown"}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {item.body}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Platforms:</span>
                        {item.selectedPlatforms?.length ? (
                          item.selectedPlatforms.map(platform => (
                            <span 
                              key={platform}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                            >
                              {platform}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">None selected</span>
                        )}
                      </div>
                      {item.scheduledAt && (
                        <div className="text-sm text-muted-foreground">
                          Scheduled for {format(new Date(item.scheduledAt), "PPP")}
                        </div>
                      )}
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
