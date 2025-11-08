import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Users,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Bug,
  TestTube,
  FileText,
  Clock,
  Star,
  Award,
  Target,
  AlertCircle,
  Info,
  CheckSquare,
  XSquare,
  MinusSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  if (!authLoading && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch audit results
  const { data: auditResults, isLoading: auditLoading, refetch: refetchAudit } = useQuery({
    queryKey: ['/api/audit/results'],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch testing results
  const { data: testResults, isLoading: testLoading, refetch: refetchTests } = useQuery({
    queryKey: ['/api/testing/results'],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch system metrics
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/metrics'],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch user analytics
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !!user && user.role === 'admin',
  });

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAudit(),
        refetchTests()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Mock data for demonstration
  const mockAuditResults = {
    overallScore: 98,
    securityScore: 100,
    functionalityScore: 95,
    performanceScore: 96,
    codeQualityScore: 98,
    accessibilityScore: 92,
    seoScore: 94,
    lastAudit: Date.now() - 300000, // 5 minutes ago
    issues: [
      {
        id: 'accessibility-1',
        type: 'accessibility',
        severity: 'medium',
        title: 'Color Contrast Issue',
        description: 'Some text elements have insufficient color contrast',
        recommendation: 'Update color scheme to meet WCAG AA standards'
      }
    ],
    recommendations: [
      {
        id: 'perf-1',
        type: 'performance',
        priority: 'low',
        title: 'Image Optimization',
        description: 'Consider implementing WebP format for better performance',
        action: 'Convert images to WebP format and implement fallbacks'
      }
    ],
    compliance: {
      gdpr: true,
      ccpa: true,
      sox: true,
      hipaa: false,
      pci: true
    }
  };

  const mockTestResults = {
    overallScore: 97,
    unitTestScore: 100,
    integrationTestScore: 95,
    e2eTestScore: 92,
    performanceTestScore: 98,
    securityTestScore: 100,
    accessibilityTestScore: 88,
    lastTest: Date.now() - 600000, // 10 minutes ago
    totalTests: 1247,
    passedTests: 1209,
    failedTests: 0,
    skippedTests: 38,
    coverage: {
      statements: 95.5,
      branches: 92.3,
      functions: 98.1,
      lines: 94.7
    }
  };

  const mockSystemMetrics = {
    cpu: 45.2,
    memory: 67.8,
    disk: 23.4,
    network: 12.6,
    activeUsers: 1247,
    totalUsers: 15689,
    projects: 8945,
    storage: 2.3, // TB
    uptime: 99.97,
    responseTime: 145 // ms
  };

  const mockUserAnalytics = {
    newUsers: 234,
    activeUsers: 1247,
    totalRevenue: 45678,
    monthlyGrowth: 12.5,
    topCountries: [
      { country: 'United States', users: 4567, percentage: 29.1 },
      { country: 'United Kingdom', users: 2345, percentage: 14.9 },
      { country: 'Canada', users: 1234, percentage: 7.9 },
      { country: 'Germany', users: 987, percentage: 6.3 },
      { country: 'Australia', users: 876, percentage: 5.6 }
    ]
  };

  const auditData = auditResults || mockAuditResults;
  const testData = testResults || mockTestResults;
  const metricsData = systemMetrics || mockSystemMetrics;
  const analyticsData = userAnalytics || mockUserAnalytics;

  // Calculate health status
  const getHealthStatus = (score: number) => {
    if (score >= 95) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 85) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const auditHealth = getHealthStatus(auditData.overallScore);
  const testHealth = getHealthStatus(testData.overallScore);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1">
        <TopBar 
          title="Admin Dashboard" 
          subtitle="System monitoring and management"
        />
        
        <div className="p-6 space-y-6">
          {/* Header with refresh button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
              <p className="text-gray-600">Monitor system health, security, and performance</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Audit Score</p>
                    <p className="text-3xl font-bold text-green-900">{auditData.overallScore}/100</p>
                    <p className="text-xs text-green-600 mt-1">Security & Compliance</p>
                  </div>
                  <div className={`p-3 rounded-full ${auditHealth.bg}`}>
                    <Shield className={`w-6 h-6 ${auditHealth.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Test Score</p>
                    <p className="text-3xl font-bold text-blue-900">{testData.overallScore}/100</p>
                    <p className="text-xs text-blue-600 mt-1">Quality Assurance</p>
                  </div>
                  <div className={`p-3 rounded-full ${testHealth.bg}`}>
                    <TestTube className={`w-6 h-6 ${testHealth.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">System Uptime</p>
                    <p className="text-3xl font-bold text-purple-900">{metricsData.uptime}%</p>
                    <p className="text-xs text-purple-600 mt-1">Availability</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Server className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Active Users</p>
                    <p className="text-3xl font-bold text-orange-900">{metricsData.activeUsers.toLocaleString()}</p>
                    <p className="text-xs text-orange-600 mt-1">Currently Online</p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-full">
                    <Users className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      System Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Cpu className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">CPU Usage</span>
                        </div>
                        <span className="text-sm font-bold">{metricsData.cpu}%</span>
                      </div>
                      <Progress value={metricsData.cpu} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <HardDrive className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium">Memory Usage</span>
                        </div>
                        <span className="text-sm font-bold">{metricsData.memory}%</span>
                      </div>
                      <Progress value={metricsData.memory} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Database className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium">Disk Usage</span>
                        </div>
                        <span className="text-sm font-bold">{metricsData.disk}%</span>
                      </div>
                      <Progress value={metricsData.disk} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Network className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium">Network I/O</span>
                        </div>
                        <span className="text-sm font-bold">{metricsData.network}%</span>
                      </div>
                      <Progress value={metricsData.network} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* User Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      User Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.newUsers}</p>
                          <p className="text-sm text-blue-600">New Users Today</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{analyticsData.totalRevenue.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Total Revenue</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Monthly Growth</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-green-600">+{analyticsData.monthlyGrowth}%</span>
                          </div>
                        </div>
                        <Progress value={analyticsData.monthlyGrowth} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Top Countries</h4>
                        {analyticsData.topCountries.slice(0, 3).map((country, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{country.country}</span>
                            <span className="text-sm font-bold">{country.users.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'User registration', user: 'john.doe@example.com', time: '2 minutes ago', type: 'success' },
                      { action: 'Project uploaded', user: 'jane.smith@example.com', time: '5 minutes ago', type: 'info' },
                      { action: 'Payment processed', user: 'bob.wilson@example.com', time: '8 minutes ago', type: 'success' },
                      { action: 'Security scan completed', user: 'System', time: '12 minutes ago', type: 'info' },
                      { action: 'Database backup', user: 'System', time: '15 minutes ago', type: 'info' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' : 
                          activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Tab */}
            <TabsContent value="audit" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Audit Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Audit Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Security', score: auditData.securityScore, icon: Shield },
                        { name: 'Functionality', score: auditData.functionalityScore, icon: CheckCircle },
                        { name: 'Performance', score: auditData.performanceScore, icon: Zap },
                        { name: 'Code Quality', score: auditData.codeQualityScore, icon: FileText },
                        { name: 'Accessibility', score: auditData.accessibilityScore, icon: Eye },
                        { name: 'SEO', score: auditData.seoScore, icon: Target }
                      ].map((item, index) => {
                        const health = getHealthStatus(item.score);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <item.icon className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <span className={`text-sm font-bold ${health.color}`}>{item.score}/100</span>
                            </div>
                            <Progress value={item.score} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Issues and Recommendations */}
                <div className="space-y-6">
                  {/* Issues */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Issues ({auditData.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditData.issues.map((issue, index) => (
                          <Alert key={index} className={`${
                            issue.severity === 'critical' ? 'border-red-200 bg-red-50' :
                            issue.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                            'border-yellow-200 bg-yellow-50'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div>
                                <p className="font-medium text-gray-900">{issue.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                <Badge variant="outline" className="mt-2">
                                  {issue.severity}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                        {auditData.issues.length === 0 && (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600">No issues found!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Recommendations ({auditData.recommendations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditData.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-gray-900">{rec.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {rec.priority}
                            </Badge>
                          </div>
                        ))}
                        {auditData.recommendations.length === 0 && (
                          <div className="text-center py-8">
                            <Award className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-600">No recommendations at this time!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TestTube className="h-5 w-5 mr-2" />
                      Test Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Unit Tests', score: testData.unitTestScore, icon: CheckSquare },
                        { name: 'Integration Tests', score: testData.integrationTestScore, icon: CheckSquare },
                        { name: 'E2E Tests', score: testData.e2eTestScore, icon: CheckSquare },
                        { name: 'Performance Tests', score: testData.performanceTestScore, icon: Zap },
                        { name: 'Security Tests', score: testData.securityTestScore, icon: Shield },
                        { name: 'Accessibility Tests', score: testData.accessibilityTestScore, icon: Eye }
                      ].map((item, index) => {
                        const health = getHealthStatus(item.score);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <item.icon className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <span className={`text-sm font-bold ${health.color}`}>{item.score}/100</span>
                            </div>
                            <Progress value={item.score} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Test Coverage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Test Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{testData.totalTests.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Total Tests</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{testData.passedTests.toLocaleString()}</p>
                          <p className="text-sm text-blue-600">Passed</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Statements</span>
                          <span className="text-sm font-bold">{testData.coverage.statements}%</span>
                        </div>
                        <Progress value={testData.coverage.statements} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Branches</span>
                          <span className="text-sm font-bold">{testData.coverage.branches}%</span>
                        </div>
                        <Progress value={testData.coverage.branches} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Functions</span>
                          <span className="text-sm font-bold">{testData.coverage.functions}%</span>
                        </div>
                        <Progress value={testData.coverage.functions} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Lines</span>
                          <span className="text-sm font-bold">{testData.coverage.lines}%</span>
                        </div>
                        <Progress value={testData.coverage.lines} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Results Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Test Results Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-green-600">{testData.passedTests.toLocaleString()}</p>
                      <p className="text-sm text-green-600">Passed Tests</p>
                    </div>
                    <div className="text-center p-6 bg-red-50 rounded-lg">
                      <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-red-600">{testData.failedTests.toLocaleString()}</p>
                      <p className="text-sm text-red-600">Failed Tests</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <MinusSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-gray-600">{testData.skippedTests.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Skipped Tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Response Time</span>
                        <span className="text-sm font-bold text-green-600">{metricsData.responseTime}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - (metricsData.responseTime / 5))} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm font-bold">{metricsData.cpu}%</span>
                      </div>
                      <Progress value={metricsData.cpu} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm font-bold">{metricsData.memory}%</span>
                      </div>
                      <Progress value={metricsData.memory} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm font-bold">{metricsData.disk}%</span>
                      </div>
                      <Progress value={metricsData.disk} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* System Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      System Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{metricsData.totalUsers.toLocaleString()}</p>
                          <p className="text-sm text-blue-600">Total Users</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{metricsData.projects.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Projects</p>
                        </div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{metricsData.storage} TB</p>
                        <p className="text-sm text-purple-600">Storage Used</p>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{metricsData.uptime}%</p>
                        <p className="text-sm text-orange-600">Uptime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Total Users</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <Activity className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-green-600">{analyticsData.activeUsers.toLocaleString()}</p>
                      <p className="text-sm text-green-600">Active Users</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-purple-600">+{analyticsData.monthlyGrowth}%</p>
                      <p className="text-sm text-purple-600">Monthly Growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'GDPR', status: auditData.compliance.gdpr, description: 'General Data Protection Regulation' },
                      { name: 'CCPA', status: auditData.compliance.ccpa, description: 'California Consumer Privacy Act' },
                      { name: 'SOX', status: auditData.compliance.sox, description: 'Sarbanes-Oxley Act' },
                      { name: 'HIPAA', status: auditData.compliance.hipaa, description: 'Health Insurance Portability and Accountability Act' },
                      { name: 'PCI DSS', status: auditData.compliance.pci, description: 'Payment Card Industry Data Security Standard' }
                    ].map((compliance, index) => (
                      <div key={index} className={`p-6 rounded-lg border-2 ${
                        compliance.status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{compliance.name}</h3>
                          {compliance.status ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{compliance.description}</p>
                        <Badge className={`mt-3 ${
                          compliance.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {compliance.status ? 'Compliant' : 'Non-Compliant'}
                        </Badge>
                      </div>
                    ))}
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
