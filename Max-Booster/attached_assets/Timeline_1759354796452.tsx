import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAudioContext } from '@/hooks/useAudioContext';
import { Split, RotateCw, Play, Square } from 'lucide-react';

interface TimelineTrack {
  id: string;
  name: string;
  color: string;
  regions: TimelineRegion[];
}

interface TimelineRegion {
  id: string;
  start: number;
  duration: number;
  label: string;
  audioUrl?: string;
}

export function Timeline() {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { context, isSupported } = useAudioContext();

  const tracks: TimelineTrack[] = [
    {
      id: '1',
      name: 'Lead Vocal',
      color: 'from-primary/60 to-primary/80',
      regions: [
        { id: 'v1', start: 0, duration: 20, label: 'Verse 1' },
        { id: 'c1', start: 40, duration: 20, label: 'Chorus' },
        { id: 'v2', start: 80, duration: 20, label: 'Verse 2' },
      ],
    },
    {
      id: '2',
      name: 'Synth Lead',
      color: 'from-secondary/60 to-secondary/80',
      regions: [
        { id: 's1', start: 8, duration: 32, label: 'Lead Melody' },
        { id: 's2', start: 60, duration: 24, label: 'Solo' },
      ],
    },
    {
      id: '3',
      name: 'Drums',
      color: 'from-accent/60 to-accent/80',
      regions: [{ id: 'd1', start: 0, duration: 96, label: 'Full Beat Pattern' }],
    },
  ];

  const timeMarkers = Array.from({ length: 8 }, (_, i) => ({
    time: i * 15,
    label: `${Math.floor((i * 15) / 60)}:${String((i * 15) % 60).padStart(2, '0')}`,
  }));

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? null : regionId);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 80; // Account for track names
    const timelineWidth = rect.width - 80;
    const timePercentage = Math.max(0, Math.min(1, clickX / timelineWidth));
    const newPosition = timePercentage * 120; // 120 seconds total

    setPlayheadPosition(newPosition);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadPosition((prev) => {
          const newPos = prev + 0.1;
          return newPos >= 120 ? 0 : newPos; // Reset at end
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <Card className="bg-card/50 border-border" data-testid="card-timeline">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Timeline & Arrangement</CardTitle>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" data-testid="button-split">
            <Split className="h-3 w-3 mr-1" />
            Split
          </Button>
          <Button size="sm" variant="outline" data-testid="button-loop">
            <RotateCw className="h-3 w-3 mr-1" />
            Loop
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsPlaying(!isPlaying)}
            data-testid="button-record-timeline"
          >
            {isPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            Record
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={timelineRef}
          className="bg-background rounded p-4 h-80 overflow-x-auto timeline-grid cursor-crosshair"
          onClick={handleTimelineClick}
          data-testid="timeline-container"
        >
          {/* Time markers */}
          <div className="flex mb-4 text-xs text-muted-foreground font-mono sticky top-0 bg-background z-10">
            <div className="w-20"></div>
            {timeMarkers.map((marker, index) => (
              <div
                key={index}
                className="w-24 text-center border-l border-muted/50 pl-1"
                data-testid={`time-marker-${index}`}
              >
                {marker.label}
              </div>
            ))}
          </div>

          {/* Track rows */}
          <div className="relative">
            {tracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className="flex items-center mb-3 h-12"
                data-testid={`track-row-${trackIndex}`}
              >
                <div className="w-20 text-xs font-medium pr-2 truncate">{track.name}</div>
                <div className="flex-1 relative h-full">
                  {track.regions.map((region) => {
                    const leftPosition = (region.start / 120) * 100;
                    const width = (region.duration / 120) * 100;

                    return (
                      <div
                        key={region.id}
                        className={`absolute h-full bg-gradient-to-r ${track.color} rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:shadow-lg ${
                          selectedRegion === region.id
                            ? 'ring-2 ring-primary shadow-lg'
                            : 'hover:brightness-110'
                        }`}
                        style={{
                          left: `${leftPosition}%`,
                          width: `${width}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegionClick(region.id);
                        }}
                        data-testid={`region-${region.id}`}
                      >
                        <span className="text-white drop-shadow-md truncate px-2">
                          {region.label}
                        </span>

                        {/* Resize handles */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 hover:bg-white/50 cursor-w-resize"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 hover:bg-white/50 cursor-e-resize"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-destructive z-20 pointer-events-none ml-20"
              style={{
                left: `${20 + (playheadPosition / 120) * (100 - 20)}%`,
              }}
              data-testid="playhead"
            >
              <div className="absolute -top-2 -left-1 w-2 h-4 bg-destructive"></div>
            </div>
          </div>
        </div>

        {/* Timeline controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm" data-testid="text-playhead-time">
              Position: {formatTime(playheadPosition)}
            </div>
            {selectedRegion && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Selected:{' '}
                {
                  tracks
                    .find((t) => t.regions.some((r) => r.id === selectedRegion))
                    ?.regions.find((r) => r.id === selectedRegion)?.label
                }
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Zoom:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
              data-testid="button-zoom-out"
            >
              -
            </Button>
            <span className="text-sm font-mono w-8 text-center">{zoom}x</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom((prev) => Math.min(4, prev + 0.25))}
              data-testid="button-zoom-in"
            >
              +
            </Button>
          </div>
        </div>

        {/* Region properties */}
        {selectedRegion && (
          <div className="mt-4 p-4 bg-muted/10 rounded-lg" data-testid="region-properties">
            <h4 className="text-sm font-medium mb-2">Region Properties</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Start:</span>
                <span className="ml-2 font-mono">
                  {formatTime(
                    tracks
                      .find((t) => t.regions.some((r) => r.id === selectedRegion))
                      ?.regions.find((r) => r.id === selectedRegion)?.start || 0
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-mono">
                  {formatTime(
                    tracks
                      .find((t) => t.regions.some((r) => r.id === selectedRegion))
                      ?.regions.find((r) => r.id === selectedRegion)?.duration || 0
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">End:</span>
                <span className="ml-2 font-mono">
                  {(() => {
                    const region = tracks
                      .find((t) => t.regions.some((r) => r.id === selectedRegion))
                      ?.regions.find((r) => r.id === selectedRegion);
                    return formatTime((region?.start || 0) + (region?.duration || 0));
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
