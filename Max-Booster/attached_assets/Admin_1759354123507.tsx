import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRequireAdmin } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  DollarSign,
  Music,
  TrendingUp,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Crown,
  Calendar,
  Mail
} from 'lucide-react';

export default function Admin() {
  const { user, isLoading: authLoading } = useRequireAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const { data: adminAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !!user,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredUsers = (users as any)?.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || user.subscriptionPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const statsCards = [
    {
      title: "Total Users",
      value: (adminAnalytics as any)?.totalUsers?.toLocaleString() || "0",
      change: `+${(adminAnalytics as any)?.recentSignups || 0} this month`,
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Revenue",
      value: `$${(adminAnalytics as any)?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+12.5% from last month",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total Projects",
      value: (adminAnalytics as any)?.totalProjects?.toLocaleString() || "0",
      change: "+8.2% from last month",
      icon: Music,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Growth Rate",
      value: "15.8%",
      change: "Monthly active users",
      icon: TrendingUp,
      color: "from-pink-500 to-rose-500"
    }
  ];

  const subscriptionStats = (adminAnalytics as any)?.subscriptionStats || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'lifetime': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'yearly': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monthly': return 'bg-green-100 text-green-800 border-green-200';
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'user': return <UserCheck className="h-4 w-4 text-green-600" />;
      default: return <UserX className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1">
        <TopBar 
          title="Admin Portal" 
          subtitle="Manage users, analytics, and platform settings"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="hover-lift transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-green-600 text-sm font-medium">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{user.username}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getPlanColor(user.subscriptionPlan)}>
                                  {user.subscriptionPlan?.toUpperCase() || 'FREE'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={getStatusColor(user.subscriptionStatus)}>
                                  {user.subscriptionStatus?.toUpperCase() || 'INACTIVE'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getRoleIcon(user.role)}
                                  <span className="capitalize">{user.role}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">User Growth Chart</h3>
                        <p className="text-gray-500 mb-4">Track platform growth over time</p>
                        <div className="text-sm text-gray-600">
                          <p>• {adminAnalytics?.totalUsers || 0} total users</p>
                          <p>• {adminAnalytics?.recentSignups || 0} new signups this month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Breakdown</h3>
                        <p className="text-gray-500 mb-4">Monthly recurring revenue and growth</p>
                        <div className="text-sm text-gray-600">
                          <p>• ${adminAnalytics?.totalRevenue?.toLocaleString() || 0} total revenue</p>
                          <p>• Monthly recurring revenue tracking</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionStats.map((stat: any, index: number) => (
                      <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{stat.plan} Plan</h3>
                        <p className="text-3xl font-bold text-primary mt-2">{stat.count}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {((stat.count / (adminAnalytics?.totalUsers || 1)) * 100).toFixed(1)}% of users
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h4>
                    <div className="space-y-3">
                      {subscriptionStats.map((stat: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${
                              stat.plan === 'lifetime' ? 'bg-purple-500' :
                              stat.plan === 'yearly' ? 'bg-blue-500' :
                              stat.plan === 'monthly' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                            <span className="capitalize font-medium">{stat.plan} Plan</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{stat.count} users</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({((stat.count / (adminAnalytics?.totalUsers || 1)) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">User Registration</h4>
                            <p className="text-sm text-gray-500">Allow new users to register</p>
                          </div>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Send system notifications via email</p>
                          </div>
                          <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500">Put platform in maintenance mode</p>
                          </div>
                          <Button variant="outline" size="sm">Disabled</Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">API Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">API Rate Limiting</h4>
                            <p className="text-sm text-gray-500">Limit API requests per user</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Webhook Endpoints</h4>
                            <p className="text-sm text-gray-500">Manage webhook configurations</p>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
