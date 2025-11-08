import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  VolumeX, 
  Headphones,
  Settings,
  Plus,
  Trash2,
  Copy
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  trackType: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  trackOrder: number;
  trackData?: any;
}

interface TrackMixerProps {
  tracks: Track[];
  selectedTrack: string | null;
  onTrackSelect: (trackId: string) => void;
  onTrackUpdate: (trackId: string, updates: Partial<Track>) => void;
}

export default function TrackMixer({ 
  tracks, 
  selectedTrack, 
  onTrackSelect, 
  onTrackUpdate 
}: TrackMixerProps) {
  const [soloedTracks, setSoloedTracks] = useState<Set<string>>(new Set());

  const handleVolumeChange = (trackId: string, volume: number) => {
    onTrackUpdate(trackId, { volume: volume / 100 });
  };

  const handlePanChange = (trackId: string, pan: number) => {
    onTrackUpdate(trackId, { pan: (pan - 50) / 50 });
  };

  const handleMute = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onTrackUpdate(trackId, { muted: !track.muted });
    }
  };

  const handleSolo = (trackId: string) => {
    const newSoloedTracks = new Set(soloedTracks);
    if (newSoloedTracks.has(trackId)) {
      newSoloedTracks.delete(trackId);
    } else {
      newSoloedTracks.add(trackId);
    }
    setSoloedTracks(newSoloedTracks);

    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onTrackUpdate(trackId, { solo: !track.solo });
    }
  };

  const getVolumeColor = (volume: number) => {
    if (volume > 0.8) return "bg-red-500";
    if (volume > 0.6) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatPan = (pan: number) => {
    if (pan === 0) return "C";
    if (pan > 0) return `${Math.round(pan * 100)}R`;
    return `${Math.round(Math.abs(pan) * 100)}L`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Track Mixer</CardTitle>
          <Button size="sm" variant="outline" data-testid="button-add-track">
            <Plus className="w-4 h-4 mr-1" />
            Add Track
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 h-full overflow-y-auto">
        {tracks.length > 0 ? (
          tracks
            .sort((a, b) => a.trackOrder - b.trackOrder)
            .map((track) => (
              <div
                key={track.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedTrack === track.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/20 hover:bg-muted/30'
                }`}
                onClick={() => onTrackSelect(track.id)}
                data-testid={`track-mixer-${track.id}`}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm truncate">{track.name}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {track.trackType}
                      </Badge>
                      {track.muted && (
                        <Badge variant="destructive" className="text-xs">
                          Muted
                        </Badge>
                      )}
                      {track.solo && (
                        <Badge variant="secondary" className="text-xs">
                          Solo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant={track.muted ? "destructive" : "outline"}
                      className="w-8 h-8 p-0 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMute(track.id);
                      }}
                      data-testid={`button-mute-${track.id}`}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      variant={track.solo ? "secondary" : "outline"}
                      className="w-8 h-8 p-0 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSolo(track.id);
                      }}
                      data-testid={`button-solo-${track.id}`}
                    >
                      S
                    </Button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Volume</span>
                    <span className="text-xs font-mono">
                      {Math.round((track.volume - 0.75) * 80)}dB
                    </span>
                  </div>
                  <Slider
                    value={[track.volume * 100]}
                    onValueChange={(value) => handleVolumeChange(track.id, value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid={`slider-volume-${track.id}`}
                  />
                </div>

                {/* Pan Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Pan</span>
                    <span className="text-xs font-mono">
                      {formatPan(track.pan)}
                    </span>
                  </div>
                  <Slider
                    value={[(track.pan + 1) * 50]}
                    onValueChange={(value) => handlePanChange(track.id, value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid={`slider-pan-${track.id}`}
                  />
                </div>

                {/* Level Meter */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Level</span>
                  </div>
                  <div className="h-16 bg-background rounded flex items-end justify-center space-x-1 p-1">
                    {/* Mock level meters */}
                    <div className={`w-2 h-full ${getVolumeColor(track.volume)} rounded opacity-70`} />
                    <div className={`w-2 h-3/4 ${getVolumeColor(track.volume * 0.8)} rounded opacity-70`} />
                  </div>
                </div>

                {/* Track Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      data-testid={`button-settings-${track.id}`}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      data-testid={`button-copy-${track.id}`}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    data-testid={`button-delete-${track.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12">
            <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tracks yet</p>
            <p className="text-muted-foreground text-xs">Add tracks to start mixing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
