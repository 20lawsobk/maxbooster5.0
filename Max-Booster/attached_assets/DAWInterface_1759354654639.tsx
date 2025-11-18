import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, RotateCcw, Circle, Volume2, Mic, Headphones } from 'lucide-react';

interface DAWInterfaceProps {
  project: any;
  onPlayPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: string;
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
}

export default function DAWInterface({
  project,
  onPlayPause,
  onStop,
  onRecord,
  isPlaying,
  isRecording,
  currentTime,
  masterVolume,
  onMasterVolumeChange,
}: DAWInterfaceProps) {
  const [playbackPosition, setPlaybackPosition] = useState(0);

  useEffect(() => {
    // Update playback position when playing
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlaybackPosition((prev) => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <Card className="daw-transport">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Transport Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={onPlayPause}
              className={`w-12 h-12 rounded-full ${isPlaying ? 'bg-secondary' : 'bg-primary'}`}
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              onClick={onStop}
              variant="outline"
              className="w-10 h-10 rounded-full"
              data-testid="button-stop"
            >
              <Square className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => setPlaybackPosition(0)}
              variant="outline"
              className="w-10 h-10 rounded-full"
              data-testid="button-rewind"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              onClick={onRecord}
              className={`w-10 h-10 rounded-full ${isRecording ? 'bg-destructive' : 'bg-muted'}`}
              data-testid="button-record"
            >
              <Circle className="w-5 h-5" />
            </Button>

            {/* Additional Controls */}
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" data-testid="button-metronome">
                🎵
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-monitor">
                <Headphones className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Position */}
          <div className="flex items-center space-x-4">
            <span className="font-mono text-lg" data-testid="text-current-time">
              {currentTime}
            </span>
            <div className="w-64 h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${Math.min(playbackPosition * 10, 100)}%` }}
              />
            </div>
            <span className="font-mono text-sm text-muted-foreground">
              {project?.duration || '03:45:00'}
            </span>
          </div>

          {/* Master Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div className="w-20">
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => onMasterVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full"
                data-testid="slider-master-volume"
              />
            </div>
            <span className="text-sm font-mono w-12" data-testid="text-master-db">
              {masterVolume > 0 ? Math.round((masterVolume - 75) * 0.8) : '-∞'}dB
            </span>
          </div>
        </div>

        {/* Project Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>BPM: {project?.bpm || 120}</span>
            <span>Key: {project?.keySignature || 'C Major'}</span>
            <span>Time: {project?.timeSignature || '4/4'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>CPU: 15%</span>
            <span>RAM: 2.1GB</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Recording</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
