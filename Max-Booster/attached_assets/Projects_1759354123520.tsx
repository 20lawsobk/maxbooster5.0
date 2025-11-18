import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireSubscription } from '@/hooks/useRequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Music,
  Upload,
  Play,
  Pause,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Clock,
  FileAudio,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Projects() {
  const { user, isLoading: authLoading } = useRequireSubscription();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    genre: '',
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/projects', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success!',
        description: 'Your project has been uploaded successfully.',
      });
      setIsUploadOpen(false);
      setUploadForm({ title: '', description: '', genre: '', file: null });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest('DELETE', `/api/projects/${projectId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project Deleted',
        description: 'The project has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and select an audio file.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('genre', uploadForm.genre);
    formData.append('audio', uploadForm.file);

    uploadMutation.mutate(formData);
    setIsUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mastering':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressValue = (status: string, progress?: number) => {
    if (progress) return progress;
    switch (status) {
      case 'completed':
        return 100;
      case 'mastering':
        return 90;
      case 'in_progress':
        return 50;
      default:
        return 25;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <main className="flex-1">
        <TopBar title="Projects" subtitle="Manage your music projects" />

        <div className="p-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
              <p className="text-gray-500">
                {(projects as any)?.length || 0} project
                {((projects as any)?.length || 0) !== 1 ? 's' : ''} total
              </p>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-bg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Describe your project"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={uploadForm.genre}
                      onValueChange={(value) =>
                        setUploadForm((prev) => ({ ...prev, genre: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="r&b">R&B</SelectItem>
                        <SelectItem value="indie">Indie</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file">Audio File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadForm((prev) => ({ ...prev, file }));
                      }}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: MP3, WAV, FLAC, OGG (Max 100MB)
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Project'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ((projects as any)?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Upload your first audio project to get started with AI-powered music tools and
                analytics.
              </p>
              <Button onClick={() => setIsUploadOpen(true)} className="gradient-bg">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(projects as any)?.map((project: any) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileAudio className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                          <p className="text-sm text-gray-500">
                            {project.genre && (
                              <span className="capitalize">{project.genre} • </span>
                            )}
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(project.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Project Status & Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getProgressValue(project.status, project.progress)}% Complete
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(project.status, project.progress)}
                        className="h-2"
                      />
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      {project.duration && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          Duration: {formatDuration(project.duration)}
                        </div>
                      )}
                      {project.fileSize && (
                        <div className="flex items-center">
                          <FileAudio className="h-3 w-3 mr-2" />
                          Size: {formatFileSize(project.fileSize)}
                        </div>
                      )}
                      {project.streams > 0 && (
                        <div className="flex items-center">
                          <Play className="h-3 w-3 mr-2" />
                          Streams: {project.streams.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Project Description */}
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                      {project.status === 'completed' ? (
                        <Button size="sm" className="flex-1">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          Continue
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
