import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/lib/studioStore';
import { AssetUploadDialog } from './AssetUploadDialog';
import {
  Search, Folder, FolderOpen, FileAudio, Music, Box, Plug,
  ChevronRight, ChevronDown, Play, Upload
} from 'lucide-react';

interface BrowserItem {
  id: string;
  name: string;
  type: 'folder' | 'preset' | 'sample' | 'plugin' | 'file';
  children?: BrowserItem[];
  size?: string;
  duration?: string;
  fileUrl?: string;
}

interface UserAsset {
  id: string;
  name: string;
  assetType: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

const MOCK_PRESETS: BrowserItem[] = [
  {
    id: 'synth',
    name: 'Synthesizers',
    type: 'folder',
    children: [
      { id: 'lead-1', name: 'Analog Lead', type: 'preset' },
      { id: 'pad-1', name: 'Warm Pad', type: 'preset' },
      { id: 'bass-1', name: 'Sub Bass', type: 'preset' },
    ],
  },
  {
    id: 'piano',
    name: 'Piano',
    type: 'folder',
    children: [
      { id: 'grand-1', name: 'Grand Piano', type: 'preset' },
      { id: 'electric-1', name: 'Electric Piano', type: 'preset' },
    ],
  },
];

interface BrowserTreeItemProps {
  item: BrowserItem;
  level: number;
  onSelect: (item: BrowserItem) => void;
  selectedId: string | null;
}

function BrowserTreeItem({ item, level, onSelect, selectedId }: BrowserTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const getIcon = () => {
    switch (item.type) {
      case 'folder':
        return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
      case 'preset':
        return <Music className="h-4 w-4" />;
      case 'sample':
        return <FileAudio className="h-4 w-4" />;
      case 'plugin':
        return <Plug className="h-4 w-4" />;
      case 'file':
        return <FileAudio className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded transition-colors ${
          selectedId === item.id ? 'bg-white/10' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
          }
          onSelect(item);
        }}
      >
        {item.type === 'folder' && (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" style={{ color: 'var(--studio-text-muted)' }} />
            ) : (
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--studio-text-muted)' }} />
            )}
          </div>
        )}
        {item.type !== 'folder' && <div className="w-4" />}
        
        <div style={{ color: 'var(--studio-text-muted)' }}>
          {getIcon()}
        </div>
        
        <span 
          className="flex-1 text-sm truncate" 
          style={{ color: 'var(--studio-text)' }}
        >
          {item.name}
        </span>
        
        {item.duration && (
          <span className="text-xs" style={{ color: 'var(--studio-text-subtle)' }}>
            {item.duration}
          </span>
        )}
        
        {item.type === 'sample' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Play className="h-3 w-3" />
          </Button>
        )}
      </div>

      {item.children && isExpanded && (
        <div>
          {item.children.map((child) => (
            <BrowserTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BrowserPanel() {
  const {
    browserSearchQuery,
    browserActiveTab,
    browserSelectedItem,
    setBrowserSearchQuery,
    setBrowserActiveTab,
    setBrowserSelectedItem,
  } = useStudioStore();

  const [localSearch, setLocalSearch] = useState(browserSearchQuery);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleSearch = (query: string) => {
    setLocalSearch(query);
    setBrowserSearchQuery(query);
  };

  // Fetch user samples
  const { data: userSamples = [], isLoading: samplesLoading } = useQuery<UserAsset[]>({
    queryKey: ['/api/assets', { assetType: 'sample' }],
    queryFn: async () => {
      const response = await fetch('/api/assets?assetType=sample');
      if (!response.ok) throw new Error('Failed to fetch samples');
      return response.json();
    },
    enabled: browserActiveTab === 'samples',
  });

  // Fetch user plugins
  const { data: userPlugins = [], isLoading: pluginsLoading } = useQuery<UserAsset[]>({
    queryKey: ['/api/assets', { assetType: 'plugin' }],
    queryFn: async () => {
      const response = await fetch('/api/assets?assetType=plugin');
      if (!response.ok) throw new Error('Failed to fetch plugins');
      return response.json();
    },
    enabled: browserActiveTab === 'plugins',
  });

  // Fetch native plugins from catalog
  const { data: nativePlugins = [], isLoading: nativePluginsLoading } = useQuery({
    queryKey: ['/api/studio/plugins'],
    queryFn: async () => {
      const response = await fetch('/api/studio/plugins');
      if (!response.ok) throw new Error('Failed to fetch native plugins');
      return response.json();
    },
    enabled: browserActiveTab === 'plugins',
  });

  // Convert user assets to browser items
  const convertAssetsToBrowserItems = (assets: UserAsset[]): BrowserItem[] => {
    return assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.assetType === 'sample' ? 'sample' : 'plugin',
      size: `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB`,
      fileUrl: asset.fileUrl,
    }));
  };

  // Convert native plugins to browser items
  const convertNativePluginsToBrowserItems = (plugins: any[]): BrowserItem[] => {
    const pluginsByCategory: Record<string, BrowserItem[]> = {};
    
    plugins.forEach(plugin => {
      const category = plugin.category || 'Other';
      if (!pluginsByCategory[category]) {
        pluginsByCategory[category] = [];
      }
      pluginsByCategory[category].push({
        id: `native-${plugin.id}`,
        name: plugin.name,
        type: 'plugin',
      });
    });

    return Object.entries(pluginsByCategory).map(([category, items]) => ({
      id: `category-${category}`,
      name: category,
      type: 'folder',
      children: items,
    }));
  };

  const filterItems = (items: BrowserItem[], query: string): BrowserItem[] => {
    if (!query) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.reduce<BrowserItem[]>((acc, item) => {
      if (item.name.toLowerCase().includes(lowerQuery)) {
        acc.push(item);
      } else if (item.children) {
        const filteredChildren = filterItems(item.children, query);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  };

  const getContentForTab = () => {
    switch (browserActiveTab) {
      case 'presets':
        return filterItems(MOCK_PRESETS, localSearch);
      case 'samples': {
        const userItems = convertAssetsToBrowserItems(userSamples);
        const allItems: BrowserItem[] = [];
        
        if (userItems.length > 0) {
          allItems.push({
            id: 'user-samples',
            name: 'My Samples',
            type: 'folder',
            children: userItems,
          });
        }
        
        return filterItems(allItems, localSearch);
      }
      case 'plugins': {
        const userItems = convertAssetsToBrowserItems(userPlugins);
        const nativeItems = convertNativePluginsToBrowserItems(nativePlugins);
        const allItems: BrowserItem[] = [];
        
        if (userItems.length > 0) {
          allItems.push({
            id: 'user-plugins',
            name: 'My Plugins',
            type: 'folder',
            children: userItems,
          });
        }
        
        allItems.push(...nativeItems);
        
        return filterItems(allItems, localSearch);
      }
      case 'files':
        return filterItems([], localSearch);
      default:
        return [];
    }
  };

  const content = getContentForTab();
  const showUploadButton = browserActiveTab === 'samples' || browserActiveTab === 'plugins';
  
  const isLoading = 
    (browserActiveTab === 'samples' && samplesLoading) ||
    (browserActiveTab === 'plugins' && (pluginsLoading || nativePluginsLoading));

  return (
    <div 
      className="h-full flex flex-col border-r"
      style={{
        background: 'var(--studio-bg-medium)',
        borderColor: 'var(--studio-border)',
      }}
    >
      {/* Header */}
      <div 
        className="h-12 px-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--studio-border)' }}
      >
        <h3 
          className="text-sm font-bold tracking-wide"
          style={{ color: 'var(--studio-text)' }}
        >
          BROWSER
        </h3>
        
        {showUploadButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            className="h-8 px-2 gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs">Upload</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--studio-border)' }}>
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            style={{ color: 'var(--studio-text-muted)' }}
          />
          <Input
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 h-9 text-sm"
            style={{
              background: 'var(--studio-bg-deep)',
              borderColor: 'var(--studio-border)',
              color: 'var(--studio-text)',
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={browserActiveTab} 
        onValueChange={(value) => setBrowserActiveTab(value as any)}
        className="flex-1 flex flex-col"
      >
        <TabsList 
          className="w-full h-10 grid grid-cols-4 rounded-none border-b"
          style={{
            background: 'var(--studio-bg-deep)',
            borderColor: 'var(--studio-border)',
          }}
        >
          <TabsTrigger 
            value="presets" 
            className="text-xs data-[state=active]:bg-white/10"
            style={{ color: 'var(--studio-text-muted)' }}
          >
            Presets
          </TabsTrigger>
          <TabsTrigger 
            value="samples" 
            className="text-xs data-[state=active]:bg-white/10"
            style={{ color: 'var(--studio-text-muted)' }}
          >
            Samples
          </TabsTrigger>
          <TabsTrigger 
            value="plugins" 
            className="text-xs data-[state=active]:bg-white/10"
            style={{ color: 'var(--studio-text-muted)' }}
          >
            Plugins
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="text-xs data-[state=active]:bg-white/10"
            style={{ color: 'var(--studio-text-muted)' }}
          >
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value={browserActiveTab} className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {isLoading ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 gap-3"
                  style={{ color: 'var(--studio-text-muted)' }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : content.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 gap-3"
                  style={{ color: 'var(--studio-text-muted)' }}
                >
                  <Box className="h-12 w-12 opacity-50" />
                  <p className="text-sm">
                    {localSearch ? 'No results found' : 'No items available'}
                  </p>
                  {showUploadButton && !localSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadDialogOpen(true)}
                      className="gap-2 mt-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload {browserActiveTab === 'samples' ? 'Samples' : 'Plugins'}
                    </Button>
                  )}
                </div>
              ) : (
                content.map((item) => (
                  <BrowserTreeItem
                    key={item.id}
                    item={item}
                    level={0}
                    onSelect={(item) => setBrowserSelectedItem(item.id)}
                    selectedId={browserSelectedItem}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AssetUploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        assetType={browserActiveTab === 'samples' ? 'sample' : 'plugin'}
      />
    </div>
  );
}
