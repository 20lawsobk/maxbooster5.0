import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, Edit, Trash2, ExternalLink, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor?: string;
  status: 'scheduled' | 'published' | 'failed';
  publishedAt?: string;
  generatedByAi: boolean;
  createdAt: string;
}

interface PostSchedulerProps {
  posts?: SocialPost[];
}

export function PostScheduler({ posts = [] }: PostSchedulerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    scheduledFor: '',
    publishNow: false,
  });

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏', color: 'text-blue-400', maxLength: 280 },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'text-pink-400', maxLength: 2200 },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'text-red-400', maxLength: 5000 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'text-green-400', maxLength: 300 },
    { id: 'facebook', name: 'Facebook', icon: '👤', color: 'text-blue-600', maxLength: 63206 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'text-blue-500', maxLength: 1300 },
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/social/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Scheduled!",
        description: "Your post has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      setIsCreateModalOpen(false);
      setNewPost({
        content: '',
        platforms: [],
        scheduledFor: '',
        publishNow: false,
      });
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('DELETE', `/api/social/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "The scheduled post has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPost.platforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.publishNow && !newPost.scheduledFor) {
      toast({
        title: "Schedule Required",
        description: "Please set a schedule time or choose to publish now.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: newPost.content,
      platforms: newPost.platforms,
      scheduledFor: newPost.publishNow ? new Date().toISOString() : newPost.scheduledFor,
    };

    createPostMutation.mutate(postData);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-accent/20 text-accent border-accent/20';
      case 'scheduled':
        return 'bg-secondary/20 text-secondary border-secondary/20';
      case 'failed':
        return 'bg-destructive/20 text-destructive border-destructive/20';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  const getCharacterCount = (content: string, platformIds: string[]) => {
    const minLength = Math.min(...platformIds.map(id => 
      platforms.find(p => p.id === id)?.maxLength || 280
    ));
    return {
      current: content.length,
      max: minLength,
      isOverLimit: content.length > minLength
    };
  };

  const formatScheduleTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Less than 1 hour';
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hours`;
    } else {
      return `${Math.round(diffInHours / 24)} days`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Post Scheduler</h3>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-post">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl" data-testid="dialog-create-post">
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-6">
              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What's happening in your music world?"
                  rows={4}
                  required
                  data-testid="textarea-post-content"
                />
                {newPost.platforms.length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Character count for selected platforms
                    </span>
                    <span className={
                      getCharacterCount(newPost.content, newPost.platforms).isOverLimit 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }>
                      {getCharacterCount(newPost.content, newPost.platforms).current}/
                      {getCharacterCount(newPost.content, newPost.platforms).max}
                    </span>
                  </div>
                )}
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div 
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                      data-testid={`platform-option-${platform.id}`}
                    >
                      <Checkbox
                        id={platform.id}
                        checked={newPost.platforms.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewPost(prev => ({
                              ...prev,
                              platforms: [...prev.platforms, platform.id]
                            }));
                          } else {
                            setNewPost(prev => ({
                              ...prev,
                              platforms: prev.platforms.filter(p => p !== platform.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg ${platform.color}`}>{platform.icon}</span>
                        <div>
                          <Label htmlFor={platform.id} className="font-medium cursor-pointer">
                            {platform.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Max {platform.maxLength} characters
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publishNow"
                    checked={newPost.publishNow}
                    onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, publishNow: !!checked }))}
                  />
                  <Label htmlFor="publishNow" className="font-medium cursor-pointer">
                    Publish immediately
                  </Label>
                </div>

                {!newPost.publishNow && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Schedule Date</Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = newPost.scheduledFor.split('T')[1] || '12:00';
                          setNewPost(prev => ({ ...prev, scheduledFor: `${date}T${time}` }));
                        }}
                        required={!newPost.publishNow}
                        data-testid="input-schedule-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleTime">Schedule Time</Label>
                      <Input
                        id="scheduleTime"
                        type="time"
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = newPost.scheduledFor.split('T')[0] || new Date().toISOString().split('T')[0];
                          setNewPost(prev => ({ ...prev, scheduledFor: `${date}T${time}` }));
                        }}
                        required={!newPost.publishNow}
                        data-testid="input-schedule-time"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-submit-post">
                  {createPostMutation.isPending ? 'Scheduling...' : 
                   newPost.publishNow ? 'Publish Now' : 'Schedule Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Posts */}
      <Card className="bg-card/50 border-border" data-testid="card-scheduled-posts">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            Scheduled Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No scheduled posts</h3>
              <p className="text-muted-foreground mb-6">
                Create your first scheduled post to manage your social media presence
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-create-first-post"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div 
                  key={post.id}
                  className="p-4 bg-muted/20 rounded-lg border border-border"
                  data-testid={`scheduled-post-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {post.platforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          return (
                            <span 
                              key={platformId}
                              className={`text-lg ${platform?.color}`}
                              title={platform?.name}
                            >
                              {platform?.icon}
                            </span>
                          );
                        })}
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      {post.generatedByAi && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${index}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeletePost(post.id)}
                        data-testid={`button-delete-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {post.status === 'published' && (
                        <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm whitespace-pre-wrap" data-testid={`text-post-content-${index}`}>
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {post.status === 'scheduled' && post.scheduledFor && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled for {formatScheduleTime(post.scheduledFor)}
                        </span>
                      )}
                      {post.status === 'published' && post.publishedAt && (
                        <span className="flex items-center">
                          <Send className="h-3 w-3 mr-1" />
                          Published {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <span>
                      Created {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
