import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";

interface Track {
  id: string;
  name: string;
  gain: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  level: number[];
}

export function TrackMixer() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      name: "Lead Vocal",
      gain: 0,
      pan: 0,
      isMuted: false,
      isSolo: false,
      level: [85, 78]
    },
    {
      id: "2", 
      name: "Synth Lead",
      gain: -3,
      pan: 25,
      isMuted: false,
      isSolo: false,
      level: [65, 58]
    },
    {
      id: "3",
      name: "Drums",
      gain: 2,
      pan: 0,
      isMuted: false,
      isSolo: false,
      level: [90, 88]
    }
  ]);

  const toggleMute = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, isSolo: !track.isSolo } : track
    ));
  };

  const updateGain = (trackId: string, value: number[]) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, gain: value[0] } : track
    ));
  };

  const updatePan = (trackId: string, value: number[]) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, pan: value[0] } : track
    ));
  };

  return (
    <Card className="bg-card/50 border-border" data-testid="card-track-mixer">
      <CardHeader>
        <CardTitle className="text-lg">Tracks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-muted/20 rounded-lg p-3" data-testid={`track-${index}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" data-testid={`text-track-name-${index}`}>{track.name}</span>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={track.isMuted ? "destructive" : "outline"}
                  className="w-6 h-6 text-xs p-0"
                  onClick={() => toggleMute(track.id)}
                  data-testid={`button-mute-${index}`}
                >
                  M
                </Button>
                <Button
                  size="sm"
                  variant={track.isSolo ? "secondary" : "outline"}
                  className="w-6 h-6 text-xs p-0"
                  onClick={() => toggleSolo(track.id)}
                  data-testid={`button-solo-${index}`}
                >
                  S
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Gain Control */}
              <div className="flex items-center space-x-2">
                <span className="text-xs w-8">Gain</span>
                <div className="flex-1">
                  <Slider
                    value={[track.gain]}
                    min={-60}
                    max={12}
                    step={0.1}
                    onValueChange={(value) => updateGain(track.id, value)}
                    className="flex-1"
                    data-testid={`slider-gain-${index}`}
                  />
                </div>
                <span className="text-xs w-10 font-mono" data-testid={`text-gain-value-${index}`}>
                  {track.gain > 0 ? '+' : ''}{track.gain}dB
                </span>
              </div>
              
              {/* Pan Control */}
              <div className="flex items-center space-x-2">
                <span className="text-xs w-8">Pan</span>
                <div className="flex-1">
                  <Slider
                    value={[track.pan]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={(value) => updatePan(track.id, value)}
                    className="flex-1"
                    data-testid={`slider-pan-${index}`}
                  />
                </div>
                <span className="text-xs w-10 font-mono" data-testid={`text-pan-value-${index}`}>
                  {track.pan === 0 ? 'C' : `${Math.abs(track.pan)}${track.pan > 0 ? 'R' : 'L'}`}
                </span>
              </div>
              
              {/* Level Meter */}
              <div className="h-16 bg-background rounded flex items-end justify-center space-x-1 p-1" data-testid={`level-meter-${index}`}>
                <div 
                  className="w-2 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded opacity-70"
                  style={{ height: `${track.level[0]}%` }}
                ></div>
                <div 
                  className="w-2 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded opacity-70"
                  style={{ height: `${track.level[1]}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
