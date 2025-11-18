import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scissors, Copy, Move, Zap, Play } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  trackType: string;
  trackOrder: number;
  trackData?: any;
}

interface TimelineProps {
  project: any;
  tracks: Track[];
  playbackPosition: number;
  onPositionChange: (position: number) => void;
  isPlaying: boolean;
  collaborators?: any[];
}

export default function Timeline({
  project,
  tracks,
  playbackPosition,
  onPositionChange,
  isPlaying,
  collaborators = [],
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<'select' | 'cut' | 'copy'>('select');

  const timeMarkers = [];
  const totalDuration = 240; // 4 minutes in seconds
  const pixelsPerSecond = zoom / 10;

  // Generate time markers
  for (let i = 0; i <= totalDuration; i += 15) {
    const minutes = Math.floor(i / 60);
    const seconds = i % 60;
    timeMarkers.push({
      time: i,
      label: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      position: i * pixelsPerSecond,
    });
  }

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const position = (x / (totalDuration * pixelsPerSecond)) * 100;
      onPositionChange(Math.max(0, Math.min(100, position)));
    }
  };

  // Mock audio regions for demonstration
  const audioRegions = [
    {
      id: 'region-1',
      trackId: tracks[0]?.id,
      start: 0,
      end: 60,
      name: 'Verse 1',
      color: 'from-primary/60 to-primary/80',
    },
    {
      id: 'region-2',
      trackId: tracks[0]?.id,
      start: 75,
      end: 105,
      name: 'Chorus',
      color: 'from-secondary/60 to-secondary/80',
    },
    {
      id: 'region-3',
      trackId: tracks[1]?.id,
      start: 15,
      end: 180,
      name: 'Synth Lead',
      color: 'from-accent/60 to-accent/80',
    },
    {
      id: 'region-4',
      trackId: tracks[2]?.id,
      start: 0,
      end: 200,
      name: 'Drum Pattern',
      color: 'from-muted/60 to-muted/80',
    },
  ];

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Timeline</h3>
            <Badge variant="outline">{project?.keySignature || 'C Major'}</Badge>
            <Badge variant="outline">{project?.bpm || 120} BPM</Badge>
          </div>

          <div className="flex items-center space-x-2">
            {/* Timeline Tools */}
            <div className="flex items-center space-x-1 bg-muted/20 rounded-lg p-1">
              <Button
                size="sm"
                variant={tool === 'select' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setTool('select')}
                data-testid="tool-select"
              >
                Select
              </Button>
              <Button
                size="sm"
                variant={tool === 'cut' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setTool('cut')}
                data-testid="tool-cut"
              >
                <Scissors className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={tool === 'copy' ? 'default' : 'ghost'}
                className="h-8 px-3"
                onClick={() => setTool('copy')}
                data-testid="tool-copy"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                data-testid="zoom-out"
              >
                -
              </Button>
              <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.min(400, zoom + 25))}
                data-testid="zoom-in"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div
              ref={timelineRef}
              className="relative bg-background rounded border"
              style={{
                width: totalDuration * pixelsPerSecond,
                minWidth: '100%',
              }}
              onClick={handleTimelineClick}
            >
              {/* Time Ruler */}
              <div className="h-8 border-b border-border bg-muted/20 relative">
                {timeMarkers.map((marker) => (
                  <div
                    key={marker.time}
                    className="absolute top-0 h-full flex items-center"
                    style={{ left: marker.position }}
                  >
                    <div className="w-px h-4 bg-border" />
                    <span className="text-xs font-mono ml-1 text-muted-foreground">
                      {marker.label}
                    </span>
                  </div>
                ))}

                {/* Playhead */}
                <div
                  className="absolute top-0 w-px h-full bg-destructive z-20"
                  style={{
                    left: (playbackPosition / 100) * totalDuration * pixelsPerSecond,
                  }}
                >
                  <div className="w-3 h-3 bg-destructive rounded-full -ml-1.5 -mt-1" />
                </div>
              </div>

              {/* Track Lanes */}
              <div className="relative">
                {tracks.map((track, index) => {
                  const trackRegions = audioRegions.filter((r) => r.trackId === track.id);

                  return (
                    <div
                      key={track.id}
                      className="h-16 border-b border-border/50 relative bg-card/50"
                      data-testid={`timeline-track-${track.id}`}
                    >
                      {/* Track Label */}
                      <div className="absolute left-2 top-2 z-10">
                        <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded">
                          {track.name}
                        </span>
                      </div>

                      {/* Audio Regions */}
                      {trackRegions.map((region) => (
                        <div
                          key={region.id}
                          className={`absolute top-2 bottom-2 bg-gradient-to-r ${region.color} rounded border timeline-track cursor-pointer transition-all hover:scale-y-105`}
                          style={{
                            left: region.start * pixelsPerSecond,
                            width: (region.end - region.start) * pixelsPerSecond,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegion(region.id);
                          }}
                          data-testid={`region-${region.id}`}
                        >
                          <div className="p-2 h-full flex items-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {region.name}
                            </span>
                          </div>

                          {/* Resize Handles */}
                          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize bg-white/20" />
                          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize bg-white/20" />
                        </div>
                      ))}

                      {/* Collaborator Cursors */}
                      {collaborators.map((collaborator) => (
                        <div
                          key={collaborator.userId}
                          className="absolute top-0 bottom-0 w-px bg-accent z-10"
                          style={{
                            left: (collaborator.cursorPosition || 0) * pixelsPerSecond,
                          }}
                        >
                          <div className="bg-accent text-accent-foreground text-xs px-1 rounded -mt-6 whitespace-nowrap">
                            {collaborator.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Empty State */}
                {tracks.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Play className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No tracks to display</p>
                      <p className="text-xs">Add tracks to start arranging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              Position: {Math.floor(((playbackPosition / 100) * totalDuration) / 60)}:
              {Math.floor(((playbackPosition / 100) * totalDuration) % 60)
                .toString()
                .padStart(2, '0')}
            </span>
            <span>Duration: {Math.floor(totalDuration / 60)}:00</span>
            <span>Zoom: {zoom}%</span>
          </div>

          <div className="flex items-center space-x-2">
            {selectedRegion && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Selected region:</span>
                <Badge variant="outline">{selectedRegion}</Badge>
                <Button size="sm" variant="outline" data-testid="clear-selection">
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
