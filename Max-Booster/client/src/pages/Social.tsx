import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentGenerator } from '@/components/social/ContentGenerator';
import { PostScheduler } from '@/components/social/PostScheduler';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Wand2,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
  Share2,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const connectedPlatforms = [
  {
    name: 'Twitter',
    username: '@alexchen_music',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    connected: true,
  },
  {
    name: 'Instagram',
    username: '@alexchenmusic',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    connected: true,
  },
  {
    name: 'YouTube',
    username: 'Alex Chen Music',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    connected: true,
  },
  {
    name: 'TikTok',
    username: '@alexchenmusic',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    connected: false,
  },
  {
    name: 'Facebook',
    username: 'Alex Chen Music',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20',
    connected: false,
  },
  {
    name: 'LinkedIn',
    username: 'Alex Chen',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    connected: false,
  },
];

export default function Social() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: socialAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/social/accounts'],
    enabled: isAuthenticated,
  });

  const { data: socialPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['/api/social/posts'],
    enabled: isAuthenticated,
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text" data-testid="text-social-header">
            Social Media Manager
          </h2>
          <p className="text-muted-foreground mt-2">
            Create, schedule, and manage your social media presence with AI
          </p>
        </div>
        <div className="flex space-x-4">
          <Button className="bg-primary hover:bg-primary/90" data-testid="button-ai-generate">
            <Wand2 className="mr-2 h-4 w-4" />
            AI Generate Content
          </Button>
          <Button variant="outline" data-testid="button-schedule-post">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
          <Button variant="outline" data-testid="button-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Connected Platforms Overview */}
      <Card className="bg-card/50 border-border" data-testid="card-connected-platforms">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Connected Platforms
            <Button variant="outline" size="sm" data-testid="button-manage-connections">
              <Settings className="h-4 w-4 mr-2" />
              Manage Connections
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {connectedPlatforms.map((platform, index) => (
              <div
                key={platform.name}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${platform.bgColor} ${platform.borderColor} ${
                  platform.connected ? 'opacity-100' : 'opacity-60'
                }`}
                data-testid={`platform-${index}`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${platform.bgColor} flex items-center justify-center`}
                >
                  <span className={`text-lg ${platform.color}`}>
                    {platform.name === 'Twitter'
                      ? '𝕏'
                      : platform.name === 'Instagram'
                        ? '📸'
                        : platform.name === 'YouTube'
                          ? '📺'
                          : platform.name === 'TikTok'
                            ? '🎵'
                            : platform.name === 'Facebook'
                              ? '👤'
                              : platform.name === 'LinkedIn'
                                ? '💼'
                                : '📱'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{platform.name}</p>
                  <p className="text-sm text-muted-foreground">{platform.username}</p>
                </div>
                <Badge
                  variant={platform.connected ? 'default' : 'outline'}
                  className={platform.connected ? 'bg-accent/20 text-accent' : ''}
                >
                  {platform.connected ? 'Connected' : 'Connect'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Social Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            Create
          </TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card/50 border-border" data-testid="card-total-followers">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">156K</p>
                  <p className="text-sm text-muted-foreground">Total Followers</p>
                  <p className="text-xs text-accent">+12% this month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border" data-testid="card-monthly-reach">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-400">89.2K</p>
                  <p className="text-sm text-muted-foreground">Monthly Reach</p>
                  <p className="text-xs text-accent">+8% vs last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border" data-testid="card-engagement-rate">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">5.7%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-xs text-accent">Above average</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border" data-testid="card-posts-this-month">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">42</p>
                  <p className="text-sm text-muted-foreground">Posts This Month</p>
                  <p className="text-xs text-muted-foreground">AI optimized</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/50 border-border" data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialPosts?.slice(0, 5).map((post: unknown, index: number) => (
                  <div
                    key={post.id}
                    className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg"
                    data-testid={`activity-item-${index}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium">
                      {post.platforms?.[0]?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">
                        Posted to {post.platforms?.join(', ') || 'Multiple platforms'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(post.scheduledFor || post.createdAt).toLocaleDateString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${
                            post.status === 'published'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-secondary/20 text-secondary'
                          }`}
                        >
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-view-post-${index}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Create your first post to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <ContentGenerator />
        </TabsContent>

        <TabsContent value="schedule">
          <PostScheduler posts={socialPosts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Platform Performance */}
          <Card className="bg-card/50 border-border" data-testid="card-platform-performance">
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedPlatforms
                  .filter((p) => p.connected)
                  .map((platform, index) => (
                    <div
                      key={platform.name}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                      data-testid={`platform-performance-${index}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full ${platform.bgColor} flex items-center justify-center`}
                        >
                          <span className={`text-sm ${platform.color}`}>
                            {platform.name === 'Twitter'
                              ? '𝕏'
                              : platform.name === 'Instagram'
                                ? '📸'
                                : platform.name === 'YouTube'
                                  ? '📺'
                                  : '📱'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">{platform.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {Math.floor(Math.random() * 50000 + 10000).toLocaleString()} followers
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(Math.random() * 10 + 2).toFixed(1)}% engagement
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          <Card className="bg-card/50 border-border" data-testid="card-top-posts">
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialPosts?.slice(0, 3).map((post: unknown, index: number) => (
                  <div
                    key={post.id}
                    className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg"
                    data-testid={`top-post-${index}`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📊</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-2">
                        {post.content.length > 80
                          ? `${post.content.substring(0, 80)}...`
                          : post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{Math.floor(Math.random() * 1000 + 100)} likes</span>
                        <span>{Math.floor(Math.random() * 100 + 10)} shares</span>
                        <span>{Math.floor(Math.random() * 50 + 5)} comments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">
                        {(Math.random() * 15 + 5).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">engagement</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No analytics data available</p>
                    <p className="text-sm">Create posts to see performance metrics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
