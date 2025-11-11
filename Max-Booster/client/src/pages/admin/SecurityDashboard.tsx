import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Server,
  FileCheck,
  Users,
  Zap,
  Clock,
  TrendingUp,
  Target,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';

interface SecurityMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface BehavioralAlert {
  id: string;
  userId: string;
  username: string;
  alertType: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  timestamp: string;
  actionTaken: string | null;
}

interface AnomalyDetection {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  detected_at: string;
  ip_address: string;
  user_agent: string;
  recommendation: string;
}

interface PenTestResult {
  id: string;
  category: string;
  finding: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  cvss_score: number;
  remediation: string;
}

interface ComplianceScore {
  standard: string;
  score: number;
  status: 'compliant' | 'partial' | 'non_compliant';
  requirements_met: number;
  total_requirements: number;
  lastAudit: string;
  nextAudit: string;
}

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const { data: securityMetrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery<SecurityMetric[]>({
    queryKey: ['/api/security/metrics'],
    queryFn: async () => {
      const mockMetrics: SecurityMetric[] = [
        {
          name: 'Threat Detection Rate',
          value: 99.7,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          change: 0.2,
        },
        {
          name: 'Failed Login Attempts',
          value: 23,
          unit: 'events',
          status: 'warning',
          trend: 'up',
          change: 15,
        },
        {
          name: 'Suspicious Activities',
          value: 8,
          unit: 'events',
          status: 'healthy',
          trend: 'down',
          change: -12,
        },
        {
          name: 'API Response Time',
          value: 145,
          unit: 'ms',
          status: 'healthy',
          trend: 'stable',
          change: 2,
        },
        {
          name: 'Encryption Coverage',
          value: 100,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          change: 0,
        },
        {
          name: 'Firewall Rules Active',
          value: 247,
          unit: 'rules',
          status: 'healthy',
          trend: 'stable',
          change: 3,
        },
      ];
      return mockMetrics;
    },
    refetchInterval: refreshInterval,
  });

  const { data: behavioralAlerts, isLoading: loadingAlerts } = useQuery<BehavioralAlert[]>({
    queryKey: ['/api/security/behavioral-alerts'],
    queryFn: async () => {
      const mockAlerts: BehavioralAlert[] = [
        {
          id: '1',
          userId: 'user_123',
          username: 'suspicious_user',
          alertType: 'Unusual Login Pattern',
          severity: 'high',
          description: 'Login from new country (Romania) after 6 months of US-only access',
          timestamp: '2 hours ago',
          actionTaken: 'Account locked pending verification',
        },
        {
          id: '2',
          userId: 'user_456',
          username: 'api_tester',
          alertType: 'Excessive API Calls',
          severity: 'medium',
          description: 'Rate limit exceeded: 1500 requests in 10 minutes',
          timestamp: '5 hours ago',
          actionTaken: 'Temporary rate limit enforced',
        },
        {
          id: '3',
          userId: 'user_789',
          username: 'data_scraper',
          alertType: 'Data Extraction Pattern',
          severity: 'high',
          description: 'Bulk data download detected: 500+ user profiles accessed',
          timestamp: '1 day ago',
          actionTaken: null,
        },
      ];
      return mockAlerts;
    },
  });

  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<AnomalyDetection[]>({
    queryKey: ['/api/security/anomaly-detection'],
    queryFn: async () => {
      const mockAnomalies: AnomalyDetection[] = [
        {
          id: '1',
          type: 'SQL Injection Attempt',
          severity: 'critical',
          description: 'Malicious SQL detected in search query parameter',
          detected_at: '30 minutes ago',
          ip_address: '185.220.101.42',
          user_agent: 'curl/7.68.0',
          recommendation: 'IP blocked automatically. Review application input validation.',
        },
        {
          id: '2',
          type: 'Brute Force Attack',
          severity: 'warning',
          description: '47 failed login attempts from same IP in 5 minutes',
          detected_at: '3 hours ago',
          ip_address: '194.26.135.212',
          user_agent: 'Mozilla/5.0 (automated)',
          recommendation: 'IP temporarily blocked. Consider implementing CAPTCHA.',
        },
      ];
      return mockAnomalies;
    },
  });

  const { data: penTestResults, isLoading: loadingPenTest } = useQuery<PenTestResult[]>({
    queryKey: ['/api/security/pentest-results'],
    queryFn: async () => {
      const mockResults: PenTestResult[] = [
        {
          id: '1',
          category: 'Authentication',
          finding: 'Session timeout not enforced after password change',
          severity: 'high',
          status: 'in_progress',
          cvss_score: 7.2,
          remediation: 'Implement session invalidation on password change',
        },
        {
          id: '2',
          category: 'API Security',
          finding: 'Missing rate limiting on password reset endpoint',
          severity: 'medium',
          status: 'open',
          cvss_score: 5.3,
          remediation: 'Add rate limiting (5 requests per hour per IP)',
        },
        {
          id: '3',
          category: 'Data Protection',
          finding: 'PII logs retained longer than policy',
          severity: 'low',
          status: 'open',
          cvss_score: 3.1,
          remediation: 'Update log rotation to 30 days for PII-containing logs',
        },
      ];
      return mockResults;
    },
  });

  const { data: complianceScores, isLoading: loadingCompliance } = useQuery<ComplianceScore[]>({
    queryKey: ['/api/security/compliance'],
    queryFn: async () => {
      const mockCompliance: ComplianceScore[] = [
        {
          standard: 'SOC 2 Type II',
          score: 94,
          status: 'compliant',
          requirements_met: 47,
          total_requirements: 50,
          lastAudit: '2025-09-15',
          nextAudit: '2025-12-15',
        },
        {
          standard: 'GDPR',
          score: 97,
          status: 'compliant',
          requirements_met: 68,
          total_requirements: 70,
          lastAudit: '2025-08-20',
          nextAudit: '2025-11-20',
        },
        {
          standard: 'PCI-DSS',
          score: 88,
          status: 'partial',
          requirements_met: 211,
          total_requirements: 240,
          lastAudit: '2025-10-01',
          nextAudit: '2025-01-01',
        },
        {
          standard: 'CCPA',
          score: 100,
          status: 'compliant',
          requirements_met: 23,
          total_requirements: 23,
          lastAudit: '2025-09-30',
          nextAudit: '2025-12-30',
        },
      ];
      return mockCompliance;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'non_compliant':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>Admin access required to view Security Dashboard</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time security monitoring and threat intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <Activity className="w-3 h-3 mr-1 animate-pulse text-green-600" />
              Live Monitoring
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetchMetrics()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingMetrics ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading metrics...</p>
            </div>
          ) : (
            securityMetrics?.map((metric) => (
              <Card key={metric.name} className={`border-l-4 ${getStatusColor(metric.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{metric.name}</h3>
                    {metric.status === 'healthy' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : metric.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {metric.trend === 'up' ? (
                      <TrendingUp className={`w-3 h-3 ${metric.change > 0 && metric.status !== 'warning' ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-green-600 rotate-180" />
                    )}
                    <span className={metric.change > 0 && metric.status !== 'warning' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-muted-foreground">vs last hour</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">
              <AlertCircle className="w-4 h-4 mr-1" />
              Behavioral Alerts
            </TabsTrigger>
            <TabsTrigger value="anomalies">
              <Eye className="w-4 h-4 mr-1" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="pentest">
              <Target className="w-4 h-4 mr-1" />
              Pen Tests
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileCheck className="w-4 h-4 mr-1" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Analytics Alerts</CardTitle>
                <CardDescription>AI-detected unusual user behavior patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAlerts ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing behavior...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {behavioralAlerts?.map((alert) => (
                      <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getSeverityBadge(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                <h4 className="font-semibold">{alert.alertType}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                User: {alert.username} ({alert.userId})
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {alert.timestamp}
                            </div>
                          </div>

                          <p className="text-sm">{alert.description}</p>

                          {alert.actionTaken ? (
                            <Alert variant="default" className="bg-green-50">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <AlertDescription>
                                <span className="font-medium">Action Taken: </span>
                                {alert.actionTaken}
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" variant="destructive">
                                Block User
                              </Button>
                              <Button size="sm" variant="outline">
                                Request Verification
                              </Button>
                              <Button size="sm" variant="ghost">
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Real-time threat detection and automated responses</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnomalies ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Scanning for threats...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies?.map((anomaly) => (
                      <Alert key={anomaly.id} variant="destructive">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <h4 className="font-semibold">{anomaly.type}</h4>
                                <Badge variant={getSeverityBadge(anomaly.severity)}>
                                  {anomaly.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Detected {anomaly.detected_at}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm">{anomaly.description}</p>

                          <div className="grid grid-cols-2 gap-3 text-sm bg-white/50 p-3 rounded">
                            <div>
                              <p className="text-xs font-medium mb-1">IP Address:</p>
                              <p className="font-mono">{anomaly.ip_address}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">User Agent:</p>
                              <p className="font-mono text-xs truncate">{anomaly.user_agent}</p>
                            </div>
                          </div>

                          <Alert variant="default" className="bg-blue-50">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <AlertDescription>
                              <span className="font-medium">Automated Response: </span>
                              {anomaly.recommendation}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pentest" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Penetration Test Results</CardTitle>
                    <CardDescription>Latest security assessment findings</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPenTest ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading results...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {penTestResults?.map((result) => (
                      <Card key={result.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{result.category}</Badge>
                                <Badge variant={getSeverityBadge(result.severity)}>
                                  {result.severity}
                                </Badge>
                                <Badge
                                  variant={
                                    result.status === 'resolved'
                                      ? 'default'
                                      : result.status === 'in_progress'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {result.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <h4 className="font-semibold">{result.finding}</h4>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">CVSS {result.cvss_score}</p>
                              <Progress value={(result.cvss_score / 10) * 100} className="h-2 w-20 mt-1" />
                            </div>
                          </div>

                          <Alert variant="default" className="bg-muted/50">
                            <Target className="h-4 w-4" />
                            <AlertDescription>
                              <span className="font-medium">Remediation: </span>
                              {result.remediation}
                            </AlertDescription>
                          </Alert>

                          {result.status === 'open' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default">
                                Start Remediation
                              </Button>
                              <Button size="sm" variant="outline">
                                Assign to Team
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Scorecards</CardTitle>
                <CardDescription>Regulatory compliance status and audit schedules</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCompliance ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading compliance data...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {complianceScores?.map((compliance) => (
                      <Card
                        key={compliance.standard}
                        className={`border-l-4 ${getStatusColor(compliance.status)}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">{compliance.standard}</h4>
                                <Badge
                                  variant={
                                    compliance.status === 'compliant'
                                      ? 'default'
                                      : compliance.status === 'partial'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                >
                                  {compliance.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {compliance.requirements_met} of {compliance.total_requirements} requirements met
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-primary">
                                {compliance.score}%
                              </div>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                          </div>

                          <Progress value={compliance.score} className="h-3" />

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Last Audit:</p>
                              <p className="font-medium">{compliance.lastAudit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Next Audit:</p>
                              <p className="font-medium">{compliance.nextAudit}</p>
                            </div>
                          </div>

                          {compliance.status !== 'compliant' && (
                            <Button size="sm" className="w-full">
                              View Compliance Gap Analysis
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
