import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Music,
  Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Royalty {
  id: string;
  platform: string;
  amount: number;
  currency: string;
  period: string;
  streams: number;
  payoutStatus: string;
  payoutDate?: string;
  releaseTitle?: string;
  beatTitle?: string;
}

export default function Royalties() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // Fetch royalties data
  const { data: royalties, isLoading } = useQuery({
    queryKey: ["/api/royalties", { period: selectedPeriod, platform: selectedPlatform }],
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-accent/20 text-accent"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-secondary/20 text-secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-primary/20 text-primary"><TrendingUp className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalEarnings = royalties?.reduce((sum: number, royalty: Royalty) => sum + royalty.amount, 0) || 0;
  const pendingPayouts = royalties?.filter((r: Royalty) => r.payoutStatus === 'pending') || [];
  const paidRoyalties = royalties?.filter((r: Royalty) => r.payoutStatus === 'paid') || [];
  const totalStreams = royalities?.reduce((sum: number, royalty: Royalty) => sum + royalty.streams, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2" data-testid="text-royalties-title">
            Royalty Management
          </h1>
          <p className="text-muted-foreground">
            Track your earnings and manage payouts across all platforms
          </p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" data-testid="button-export-royalties">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          
          <Button data-testid="button-request-payout">
            <DollarSign className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphism" data-testid="card-total-earnings">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-accent">+15% vs last period</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism" data-testid="card-pending-payouts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">${pendingPayouts.reduce((sum: number, p: Royalty) => sum + p.amount, 0).toLocaleString()}</p>
                <p className="text-xs text-secondary">Next payout: Dec 15</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism" data-testid="card-total-streams">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{(totalStreams / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-accent">+8% vs last period</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Play className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism" data-testid="card-avg-rpm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. RPM</p>
                <p className="text-2xl font-bold">$3.51</p>
                <p className="text-xs text-primary">Revenue per 1K streams</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="statements" data-testid="tab-statements">Statements</TabsTrigger>
          <TabsTrigger value="splits" data-testid="tab-splits">Splits</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Breakdown */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Earnings by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: "Spotify", amount: 4250, percentage: 42, streams: "1.08M", icon: "🎵" },
                    { platform: "Apple Music", amount: 2890, percentage: 29, streams: "672K", icon: "🍎" },
                    { platform: "YouTube Music", amount: 1560, percentage: 15, streams: "360K", icon: "📺" },
                    { platform: "Amazon Music", amount: 980, percentage: 10, streams: "192K", icon: "📦" },
                    { platform: "Others", amount: 420, percentage: 4, streams: "96K", icon: "🎶" }
                  ].map((platform) => (
                    <div key={platform.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{platform.icon}</span>
                          <span className="font-medium">{platform.platform}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${platform.amount}</span>
                          <p className="text-xs text-muted-foreground">{platform.streams}</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${platform.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Dec 1, 2024", amount: 2840, status: "paid", platform: "Spotify" },
                    { date: "Nov 1, 2024", amount: 2130, status: "paid", platform: "Apple Music" },
                    { date: "Oct 1, 2024", amount: 1920, status: "paid", platform: "YouTube Music" },
                    { date: "Sep 15, 2024", amount: 650, status: "paid", platform: "Beat Sales" }
                  ].map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded" data-testid={`payout-${index}`}>
                      <div>
                        <p className="font-medium">${payout.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payout.platform} • {payout.date}</p>
                      </div>
                      {getStatusBadge(payout.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Earning Tracks */}
            <Card className="glassmorphism lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Earning Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Midnight Groove", earnings: 1840, streams: "456K", rpm: 4.03 },
                    { title: "Electric Dreams", earnings: 1320, streams: "324K", rpm: 4.07 },
                    { title: "Neon Nights", earnings: 1156, streams: "289K", rpm: 4.00 },
                    { title: "Summer Vibes", earnings: 936, streams: "234K", rpm: 4.00 },
                    { title: "Urban Flow", earnings: 792, streams: "198K", rpm: 4.00 }
                  ].map((track, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded" data-testid={`top-earning-track-${index}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">{track.streams} streams</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${track.earnings}</p>
                        <p className="text-sm text-muted-foreground">${track.rpm} RPM</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          {/* Monthly Statements */}
          <Card className="glassmorphism">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Royalty Statements</CardTitle>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-48" data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="apple">Apple Music</SelectItem>
                    <SelectItem value="youtube">YouTube Music</SelectItem>
                    <SelectItem value="amazon">Amazon Music</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">Period</th>
                      <th className="text-left p-3">Platform</th>
                      <th className="text-right p-3">Streams</th>
                      <th className="text-right p-3">Earnings</th>
                      <th className="text-right p-3">Status</th>
                      <th className="text-right p-3">Payout Date</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { period: "Dec 2024", platform: "Spotify", streams: "456K", earnings: "$1,824", status: "pending", payoutDate: "Jan 15, 2025" },
                      { period: "Nov 2024", platform: "Spotify", streams: "398K", earnings: "$1,592", status: "paid", payoutDate: "Dec 15, 2024" },
                      { period: "Dec 2024", platform: "Apple Music", streams: "324K", earnings: "$1,296", status: "pending", payoutDate: "Jan 15, 2025" },
                      { period: "Nov 2024", platform: "Apple Music", streams: "289K", earnings: "$1,156", status: "paid", payoutDate: "Dec 15, 2024" }
                    ].map((statement, index) => (
                      <tr key={index} className="border-b border-border/50" data-testid={`statement-${index}`}>
                        <td className="p-3">{statement.period}</td>
                        <td className="p-3">{statement.platform}</td>
                        <td className="text-right p-3">{statement.streams}</td>
                        <td className="text-right p-3 font-medium">{statement.earnings}</td>
                        <td className="text-right p-3">{getStatusBadge(statement.status)}</td>
                        <td className="text-right p-3">{statement.payoutDate}</td>
                        <td className="text-right p-3">
                          <Button variant="ghost" size="sm" data-testid={`button-download-statement-${index}`}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="splits" className="space-y-6">
          {/* Royalty Splits Management */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Royalty Splits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Collaborators */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Collaborators</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Chen", role: "Producer", email: "alex@example.com", percentage: 65, avatar: "🎵" },
                      { name: "Sarah Kim", role: "Vocalist", email: "sarah@example.com", percentage: 25, avatar: "🎤" },
                      { name: "Mike Johnson", role: "Songwriter", email: "mike@example.com", percentage: 10, avatar: "✍️" }
                    ].map((collaborator, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg" data-testid={`collaborator-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">{collaborator.avatar}</span>
                          </div>
                          <div>
                            <p className="font-medium">{collaborator.name}</p>
                            <p className="text-sm text-muted-foreground">{collaborator.role} • {collaborator.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{collaborator.percentage}%</p>
                          <div className="flex space-x-2 mt-1">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-split-${index}`}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-remove-split-${index}`}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Collaborator */}
                <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">Add a new collaborator to share royalties</p>
                  <Button data-testid="button-add-collaborator">
                    <Users className="w-4 h-4 mr-2" />
                    Add Collaborator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Payout Settings */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">••••••1234 • Primary</p>
                        </div>
                      </div>
                      <Badge className="bg-accent/20 text-accent">Active</Badge>
                    </div>
                    
                    <Button variant="outline" className="w-full" data-testid="button-add-payment-method">
                      Add Payment Method
                    </Button>
                  </div>
                </div>

                {/* Payout Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payout Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Minimum Payout Amount</p>
                        <p className="text-sm text-muted-foreground">Set the minimum amount for automatic payouts</p>
                      </div>
                      <Select defaultValue="100">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">$50</SelectItem>
                          <SelectItem value="100">$100</SelectItem>
                          <SelectItem value="250">$250</SelectItem>
                          <SelectItem value="500">$500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payout Frequency</p>
                        <p className="text-sm text-muted-foreground">How often you want to receive payouts</p>
                      </div>
                      <Select defaultValue="monthly">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">Tax Forms</p>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please complete your tax information to ensure proper reporting and compliance.
                    </p>
                    <Button data-testid="button-update-tax-info">
                      Update Tax Information
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
