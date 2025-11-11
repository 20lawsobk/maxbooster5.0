import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/lib/studioStore';
import {
  Search, Folder, FolderOpen, FileAudio, Music, Box, Plug,
  ChevronRight, ChevronDown, Play, Download
} from 'lucide-react';

interface BrowserItem {
  id: string;
  name: string;
  type: 'folder' | 'preset' | 'sample' | 'plugin' | 'file';
  children?: BrowserItem[];
  size?: string;
  duration?: string;
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

const MOCK_SAMPLES: BrowserItem[] = [
  {
    id: 'drums',
    name: 'Drums',
    type: 'folder',
    children: [
      { id: 'kick-1', name: 'Kick 01.wav', type: 'sample', size: '2.1 MB', duration: '0:03' },
      { id: 'snare-1', name: 'Snare 01.wav', type: 'sample', size: '1.8 MB', duration: '0:02' },
      { id: 'hihat-1', name: 'HiHat 01.wav', type: 'sample', size: '0.9 MB', duration: '0:01' },
    ],
  },
  {
    id: 'loops',
    name: 'Loops',
    type: 'folder',
    children: [
      { id: 'loop-1', name: 'Beat Loop 120.wav', type: 'sample', size: '8.4 MB', duration: '0:16' },
      { id: 'loop-2', name: 'Bass Loop.wav', type: 'sample', size: '4.2 MB', duration: '0:08' },
    ],
  },
];

const MOCK_PLUGINS: BrowserItem[] = [
  { id: 'eq', name: 'Parametric EQ', type: 'plugin' },
  { id: 'comp', name: 'Compressor', type: 'plugin' },
  { id: 'reverb', name: 'Reverb', type: 'plugin' },
  { id: 'delay', name: 'Delay', type: 'plugin' },
];

const MOCK_FILES: BrowserItem[] = [
  {
    id: 'project',
    name: 'Project Files',
    type: 'folder',
    children: [
      { id: 'audio-1', name: 'Vocal Take 1.wav', type: 'file', size: '45 MB', duration: '3:24' },
      { id: 'audio-2', name: 'Guitar.wav', type: 'file', size: '32 MB', duration: '2:15' },
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

  const handleSearch = (query: string) => {
    setLocalSearch(query);
    setBrowserSearchQuery(query);
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
      case 'samples':
        return filterItems(MOCK_SAMPLES, localSearch);
      case 'plugins':
        return filterItems(MOCK_PLUGINS, localSearch);
      case 'files':
        return filterItems(MOCK_FILES, localSearch);
      default:
        return [];
    }
  };

  const content = getContentForTab();

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
        className="h-12 px-4 flex items-center border-b"
        style={{ borderColor: 'var(--studio-border)' }}
      >
        <h3 
          className="text-sm font-bold tracking-wide"
          style={{ color: 'var(--studio-text)' }}
        >
          BROWSER
        </h3>
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
              {content.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 gap-2"
                  style={{ color: 'var(--studio-text-muted)' }}
                >
                  <Box className="h-12 w-12 opacity-50" />
                  <p className="text-sm">
                    {localSearch ? 'No results found' : 'No items available'}
                  </p>
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
    </div>
  );
}
