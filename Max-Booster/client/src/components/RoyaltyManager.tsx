import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Lock,
  Unlock,
  TrendingUp,
  DollarSign,
  Users,
  FileCheck,
  History,
  AlertTriangle,
  LineChart,
  BarChart3
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RoyaltyManagerProps {
  royalties?: any[];
}

export default function RoyaltyManager({ royalties = [] }: RoyaltyManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("import");
  
  // Import Tab State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Tax Documents Tab State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [taxFormData, setTaxFormData] = useState({
    legalName: "",
    taxIdType: "ssn",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    w9OnFile: false
  });
  
  // Splits Tab State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [splits, setSplits] = useState<any[]>([]);
  
  // Forecasting Tab State
  const [forecastProjectId, setForecastProjectId] = useState<string>("");
  const [forecastGranularity, setForecastGranularity] = useState<string>("monthly");

  // ===== IMPORT TAB QUERIES =====
  const { data: importHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/royalties/import/history'],
    enabled: activeTab === 'import'
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/royalties/import/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File uploaded",
        description: "CSV file uploaded successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/import/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/royalties/import/preview', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Preview failed');
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewData(data);
      toast({
        title: "Preview generated",
        description: `${data.totalRows || 0} rows ready for import`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Preview failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/royalties/import/execute', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Import failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import completed",
        description: `${data.succeeded || 0} rows imported successfully`
      });
      setSelectedFile(null);
      setPreviewData(null);
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/import/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // ===== TAX DOCUMENTS TAB QUERIES =====
  const { data: taxProfile, isLoading: taxProfileLoading } = useQuery({
    queryKey: ['/api/royalties/tax/profile'],
    enabled: activeTab === 'tax'
  });

  const { data: taxDocuments, isLoading: taxDocsLoading } = useQuery({
    queryKey: ['/api/royalties/tax/documents', selectedYear],
    enabled: activeTab === 'tax' && !!selectedYear
  });

  const saveTaxProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/royalties/tax/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Tax profile saved",
        description: "Your tax information has been updated"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/tax/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const generateTaxDocMutation = useMutation({
    mutationFn: async (year: string) => {
      return await apiRequest('POST', `/api/royalties/tax/generate/${year}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Document generated",
        description: "1099-MISC has been generated"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/tax/documents', selectedYear] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // ===== SPLITS TAB QUERIES =====
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: activeTab === 'splits'
  });

  const { data: projectSplits, isLoading: splitsLoading } = useQuery({
    queryKey: ['/api/royalties/splits', selectedProjectId],
    enabled: activeTab === 'splits' && !!selectedProjectId
  });

  const validateSplitsMutation = useMutation({
    mutationFn: async ({ projectId, splits }: { projectId: string; splits: any[] }) => {
      return await apiRequest('POST', `/api/royalties/splits/${projectId}/validate`, { splits });
    },
    onSuccess: (data) => {
      toast({
        title: "Validation complete",
        description: data.valid ? "Splits are valid" : "Splits must sum to 100%",
        variant: data.valid ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const lockSplitMutation = useMutation({
    mutationFn: async ({ splitId, locked }: { splitId: string; locked: boolean }) => {
      return await apiRequest('POST', `/api/royalties/splits/${splitId}/lock`, { locked });
    },
    onSuccess: (data) => {
      toast({
        title: data.locked ? "Splits locked" : "Splits unlocked",
        description: data.locked ? "Splits are now locked" : "Splits can now be edited"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/splits', selectedProjectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // ===== FORECASTING TAB QUERIES =====
  const { data: latestForecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['/api/royalties/forecast', forecastProjectId, 'latest'],
    enabled: activeTab === 'forecasting' && !!forecastProjectId
  });

  const { data: allForecasts, isLoading: allForecastsLoading } = useQuery({
    queryKey: ['/api/royalties/forecast', forecastProjectId],
    enabled: activeTab === 'forecasting' && !!forecastProjectId
  });

  const generateForecastMutation = useMutation({
    mutationFn: async ({ projectId, granularity }: { projectId: string; granularity: string }) => {
      return await apiRequest('POST', '/api/royalties/forecast', { projectId, granularity });
    },
    onSuccess: () => {
      toast({
        title: "Forecast generated",
        description: "Revenue forecast has been calculated"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/royalties/forecast', forecastProjectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Forecast failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // ===== IMPORT TAB HANDLERS =====
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setPreviewData(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setPreviewData(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a CSV file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handlePreview = () => {
    if (selectedFile) {
      previewMutation.mutate(selectedFile);
    }
  };

  const handleExecuteImport = () => {
    if (selectedFile) {
      executeMutation.mutate(selectedFile);
    }
  };

  // ===== TAX TAB HANDLERS =====
  const handleSaveTaxProfile = () => {
    saveTaxProfileMutation.mutate(taxFormData);
  };

  const handleGenerateTaxDoc = () => {
    generateTaxDocMutation.mutate(selectedYear);
  };

  // ===== SPLITS TAB HANDLERS =====
  const handleValidateSplits = () => {
    if (selectedProjectId && projectSplits?.splits) {
      validateSplitsMutation.mutate({
        projectId: selectedProjectId,
        splits: projectSplits.splits
      });
    }
  };

  const handleToggleLock = (splitId: string, currentLocked: boolean) => {
    lockSplitMutation.mutate({
      splitId,
      locked: !currentLocked
    });
  };

  // ===== FORECASTING TAB HANDLERS =====
  const handleGenerateForecast = () => {
    if (forecastProjectId) {
      generateForecastMutation.mutate({
        projectId: forecastProjectId,
        granularity: forecastGranularity
      });
    }
  };

  // Calculate splits total percentage
  const splitsTotal = projectSplits?.splits?.reduce((sum: number, split: any) => 
    sum + (Number(split.percentage) || 0), 0) || 0;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4" data-testid="royalty-tabs">
        <TabsTrigger value="import" data-testid="tab-import">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </TabsTrigger>
        <TabsTrigger value="tax" data-testid="tab-tax">
          <FileText className="w-4 h-4 mr-2" />
          Tax Documents
        </TabsTrigger>
        <TabsTrigger value="splits" data-testid="tab-splits">
          <Users className="w-4 h-4 mr-2" />
          Splits
        </TabsTrigger>
        <TabsTrigger value="forecasting" data-testid="tab-forecasting">
          <TrendingUp className="w-4 h-4 mr-2" />
          Forecasting
        </TabsTrigger>
      </TabsList>

      {/* ===== IMPORT TAB ===== */}
      <TabsContent value="import" className="space-y-6">
        {/* CSV Upload Section */}
        <Card data-testid="card-csv-upload">
          <CardHeader>
            <CardTitle>Import Royalty Data</CardTitle>
            <CardDescription>Upload CSV files with royalty earnings data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              data-testid="dropzone-csv"
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-lg font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Drop CSV file here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-csv"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                data-testid="button-browse-files"
              >
                Browse Files
              </Button>
            </div>

            {/* File Actions */}
            {selectedFile && (
              <div className="flex gap-3">
                <Button
                  onClick={handlePreview}
                  disabled={previewMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-preview-csv"
                >
                  {previewMutation.isPending ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExecuteImport}
                  disabled={executeMutation.isPending || !previewData}
                  className="flex-1"
                  data-testid="button-execute-import"
                >
                  {executeMutation.isPending ? (
                    <>Importing...</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Execute Import
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Preview Data */}
            {previewData && (
              <div className="border rounded-lg p-4 bg-muted/20" data-testid="preview-data">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Preview Results</h4>
                  <Badge variant={previewData.duplicate ? "destructive" : "default"}>
                    {previewData.duplicate ? 'Duplicate File' : 'Ready to Import'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Rows</p>
                    <p className="font-semibold text-lg" data-testid="preview-total-rows">{previewData.totalRows || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid</p>
                    <p className="font-semibold text-lg text-green-600" data-testid="preview-valid-rows">
                      {previewData.estimatedValid || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invalid</p>
                    <p className="font-semibold text-lg text-destructive" data-testid="preview-invalid-rows">
                      {previewData.estimatedInvalid || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import History */}
        <Card data-testid="card-import-history">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Import History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Success</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory?.history?.length > 0 ? (
                    importHistory.history.map((item: any, idx: number) => (
                      <TableRow key={item.id || idx} data-testid={`history-row-${idx}`}>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{item.filename}</TableCell>
                        <TableCell className="text-right">{item.rowsProcessed || 0}</TableCell>
                        <TableCell className="text-right text-green-600">{item.rowsSucceeded || 0}</TableCell>
                        <TableCell className="text-right text-destructive">{item.rowsFailed || 0}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No import history yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ===== TAX DOCUMENTS TAB ===== */}
      <TabsContent value="tax" className="space-y-6">
        {/* Tax Profile Form */}
        <Card data-testid="card-tax-profile">
          <CardHeader>
            <CardTitle>Tax Profile</CardTitle>
            <CardDescription>Update your tax information for 1099-MISC generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxProfileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Name</Label>
                    <Input
                      id="legalName"
                      value={taxFormData.legalName || taxProfile?.legalName || ''}
                      onChange={(e) => setTaxFormData(prev => ({ ...prev, legalName: e.target.value }))}
                      placeholder="Full legal name"
                      data-testid="input-legal-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxIdType">Tax ID Type</Label>
                    <Select
                      value={taxFormData.taxIdType || taxProfile?.taxIdType || 'ssn'}
                      onValueChange={(value) => setTaxFormData(prev => ({ ...prev, taxIdType: value }))}
                    >
                      <SelectTrigger data-testid="select-tax-id-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ssn">SSN</SelectItem>
                        <SelectItem value="ein">EIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={taxFormData.taxId || taxProfile?.taxId || ''}
                    onChange={(e) => setTaxFormData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder={taxFormData.taxIdType === 'ssn' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                    data-testid="input-tax-id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={taxFormData.address || taxProfile?.address || ''}
                    onChange={(e) => setTaxFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address"
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={taxFormData.city || taxProfile?.city || ''}
                      onChange={(e) => setTaxFormData(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={taxFormData.state || taxProfile?.state || ''}
                      onChange={(e) => setTaxFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="CA"
                      data-testid="input-state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={taxFormData.zipCode || taxProfile?.zipCode || ''}
                      onChange={(e) => setTaxFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveTaxProfile}
                  disabled={saveTaxProfileMutation.isPending}
                  data-testid="button-save-tax-profile"
                >
                  {saveTaxProfileMutation.isPending ? 'Saving...' : 'Save Tax Profile'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tax Documents List */}
        <Card data-testid="card-tax-documents">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>1099-MISC Documents</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32" data-testid="select-tax-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerateTaxDoc}
                  disabled={generateTaxDocMutation.isPending}
                  data-testid="button-generate-tax-doc"
                >
                  {generateTaxDocMutation.isPending ? (
                    'Generating...'
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {taxDocsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : taxDocuments?.documents?.length > 0 ? (
              <div className="space-y-3">
                {taxDocuments.documents.map((doc: any, idx: number) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`tax-doc-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">1099-MISC {doc.taxYear || selectedYear}</p>
                        <p className="text-sm text-muted-foreground">
                          Generated {new Date(doc.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">${doc.amounts?.box2_royalties || 0}</Badge>
                      <Button size="sm" variant="ghost" data-testid={`button-download-doc-${idx}`}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tax documents for {selectedYear}</p>
                <p className="text-sm mt-1">Click Generate to create a new 1099-MISC</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ===== SPLITS TAB ===== */}
      <TabsContent value="splits" className="space-y-6">
        {/* Project Selector */}
        <Card data-testid="card-project-selector">
          <CardHeader>
            <CardTitle>Royalty Splits Management</CardTitle>
            <CardDescription>Manage revenue sharing for your projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
              {projectsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger data-testid="select-project">
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.projects?.length > 0 ? (
                      projects.projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No projects available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Split Validation Warning */}
            {selectedProjectId && splitsTotal !== 100 && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg" data-testid="split-validation-error">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Invalid Split Distribution</p>
                  <p className="text-sm text-destructive/80">
                    Total percentage: {splitsTotal.toFixed(1)}% (must equal 100%)
                  </p>
                </div>
              </div>
            )}

            {/* Split Success */}
            {selectedProjectId && splitsTotal === 100 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg" data-testid="split-validation-success">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-600">Valid Split Distribution</p>
                  <p className="text-sm text-green-600/80">
                    Total: {splitsTotal.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Splits List */}
        {selectedProjectId && (
          <Card data-testid="card-splits-list">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Split Configuration</CardTitle>
                <Button
                  onClick={handleValidateSplits}
                  disabled={validateSplitsMutation.isPending}
                  variant="outline"
                  data-testid="button-validate-splits"
                >
                  {validateSplitsMutation.isPending ? 'Validating...' : 'Validate Splits'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {splitsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : projectSplits?.splits?.length > 0 ? (
                <div className="space-y-3">
                  {projectSplits.splits.map((split: any, idx: number) => (
                    <div
                      key={split.id || idx}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`split-${idx}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{split.collaboratorName || 'Collaborator'}</p>
                        <p className="text-sm text-muted-foreground">{split.role || 'Role'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{split.percentage}%</p>
                        </div>
                        <Button
                          size="sm"
                          variant={split.locked ? "default" : "outline"}
                          onClick={() => handleToggleLock(split.id, split.locked)}
                          disabled={lockSplitMutation.isPending}
                          data-testid={`button-lock-split-${idx}`}
                        >
                          {split.locked ? (
                            <>
                              <Lock className="w-4 h-4 mr-1" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-1" />
                              Unlocked
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No splits configured for this project</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ===== FORECASTING TAB ===== */}
      <TabsContent value="forecasting" className="space-y-6">
        {/* Forecast Request Form */}
        <Card data-testid="card-forecast-form">
          <CardHeader>
            <CardTitle>Revenue Forecasting</CardTitle>
            <CardDescription>Generate AI-powered revenue predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecastProject">Project</Label>
                {projectsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={forecastProjectId} onValueChange={setForecastProjectId}>
                    <SelectTrigger data-testid="select-forecast-project">
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.projects?.length > 0 ? (
                        projects.projects.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No projects available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="granularity">Granularity</Label>
                <Select value={forecastGranularity} onValueChange={setForecastGranularity}>
                  <SelectTrigger data-testid="select-forecast-granularity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerateForecast}
              disabled={generateForecastMutation.isPending || !forecastProjectId}
              className="w-full"
              data-testid="button-generate-forecast"
            >
              {generateForecastMutation.isPending ? (
                'Generating Forecast...'
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Forecast Visualization */}
        {forecastProjectId && latestForecast && (
          <Card data-testid="card-forecast-results">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="w-5 h-5 mr-2" />
                Forecast Results
              </CardTitle>
              <CardDescription>
                {latestForecast.granularity} forecast • {latestForecast.confidenceLevel}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chart */}
              {forecastLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64" data-testid="forecast-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={latestForecast.forecastPeriods || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.1}
                        name="Upper Bound"
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                        name="Predicted"
                      />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stackId="3"
                        stroke="#ffc658"
                        fill="#ffc658"
                        fillOpacity={0.1}
                        name="Lower Bound"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Forecast Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Predicted</TableHead>
                    <TableHead className="text-right">Lower Bound</TableHead>
                    <TableHead className="text-right">Upper Bound</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestForecast.forecastPeriods?.map((period: any, idx: number) => (
                    <TableRow key={idx} data-testid={`forecast-period-${idx}`}>
                      <TableCell className="font-medium">{period.period}</TableCell>
                      <TableCell className="text-right">
                        ${period.predicted?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${period.lower?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${period.upper?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
