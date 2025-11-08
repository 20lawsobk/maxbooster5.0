import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2, 
  VolumeX,
  Mic,
  Upload,
  Settings,
  Zap
} from "lucide-react";
import { useAudioPlayer, Track } from "@/hooks/useAudioPlayer";
import AudioRecorder from "./AudioRecorder";

interface TrackControlsProps {
  projectId?: string;
  initialTracks?: Track[];
  onTracksChange?: (tracks: Track[]) => void;
}

export default function TrackControls({ 
  projectId, 
  initialTracks = [], 
  onTracksChange 
}: TrackControlsProps) {
  const [showRecorder, setShowRecorder] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  const {
    isPlaying,
    isPaused,
    isLoading,
    currentTime,
    duration,
    playbackRate,
    tracks,
    masterVolume,
    bpm,
    isSupported,
    addTrack,
    removeTrack,
    play,
    pause,
    stop,
    seek,
    updateTrackGain,
    updateTrackPan,
    muteTrack,
    soloTrack,
    setMasterVolume,
    setPlaybackRate,
  } = useAudioPlayer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      const track: Track = {
        id: `track_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url,
        duration: 0, // Will be set after loading
        gain: 1.0,
        pan: 0,
        isMuted: false,
        isSolo: false,
      };
      
      try {
        await addTrack(track);
        onTracksChange?.(tracks);
      } catch (error) {
        console.error('Error adding track:', error);
      }
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleRecordingComplete = async (blob: Blob, analysis: any) => {
    const url = URL.createObjectURL(blob);
    const track: Track = {
      id: `recording_${Date.now()}`,
      name: `Recording ${new Date().toLocaleTimeString()}`,
      url,
      duration: analysis.duration || 0,
      gain: 1.0,
      pan: 0,
      isMuted: false,
      isSolo: false,
    };
    
    try {
      await addTrack(track);
      onTracksChange?.(tracks);
      setShowRecorder(false);
    } catch (error) {
      console.error('Error adding recorded track:', error);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6 text-center">
          <Volume2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audio Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support Web Audio API. Please use a modern browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transport Controls */}
      <Card className="bg-card/50 border-border" data-testid="transport-controls">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transport</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <Badge variant="outline">{bpm} BPM</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Transport */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => seek(0)}
              disabled={isLoading || duration === 0}
              data-testid="button-rewind"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant={isPlaying ? "destructive" : "default"}
              size="lg"
              onClick={isPlaying ? pause : play}
              disabled={isLoading || tracks.length === 0}
              className="px-8"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 mr-2" />
              ) : (
                <Play className="h-6 w-6 mr-2" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={stop}
              disabled={isLoading || (!isPlaying && !isPaused)}
              data-testid="button-stop"
            >
              <Square className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => seek(duration)}
              disabled={isLoading || duration === 0}
              data-testid="button-fast-forward"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Timeline */}
          {duration > 0 && (
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                data-testid="timeline-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Additional Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isLooping}
                  onCheckedChange={setIsLooping}
                  data-testid="switch-loop"
                />
                <span className="text-sm">Loop</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Speed:</span>
                <Slider
                  value={[playbackRate]}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onValueChange={(value) => setPlaybackRate(value[0])}
                  className="w-20"
                  data-testid="playback-rate-slider"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {playbackRate.toFixed(1)}x
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[masterVolume]}
                max={1}
                step={0.01}
                onValueChange={(value) => setMasterVolume(value[0])}
                className="w-20"
                data-testid="master-volume-slider"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Track Management */}
      <Card className="bg-card/50 border-border" data-testid="track-management">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tracks ({tracks.length})</span>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowRecorder(!showRecorder)}
                variant="outline"
                size="sm"
                data-testid="button-toggle-recorder"
              >
                <Mic className="h-4 w-4 mr-2" />
                Record
              </Button>
              
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
                size="sm"
                data-testid="button-upload-track"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <input
                id="file-upload"
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No tracks loaded</p>
              <p className="text-sm">Import audio files or record new tracks to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedTrack === track.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-muted/20'
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                  data-testid={`track-item-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" data-testid={`track-name-${index}`}>
                      {track.name}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          muteTrack(track.id);
                        }}
                        variant={track.isMuted ? "destructive" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        data-testid={`button-mute-${index}`}
                      >
                        {track.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          soloTrack(track.id);
                        }}
                        variant={track.isSolo ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        data-testid={`button-solo-${index}`}
                      >
                        S
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        data-testid={`button-remove-${index}`}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-muted-foreground mb-1 block">Gain</label>
                      <Slider
                        value={[track.gain]}
                        min={0}
                        max={2}
                        step={0.01}
                        onValueChange={(value) => updateTrackGain(track.id, value[0])}
                        className="w-full"
                        data-testid={`gain-slider-${index}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {(track.gain * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-muted-foreground mb-1 block">Pan</label>
                      <Slider
                        value={[track.pan]}
                        min={-1}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => updateTrackPan(track.id, value[0])}
                        className="w-full"
                        data-testid={`pan-slider-${index}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {track.pan === 0 ? 'Center' : 
                         track.pan < 0 ? `L${Math.abs(track.pan * 100).toFixed(0)}` :
                         `R${Math.abs(track.pan * 100).toFixed(0)}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Recorder */}
      {showRecorder && (
        <AudioRecorder
          trackId={selectedTrack || undefined}
          onRecordingComplete={handleRecordingComplete}
        />
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-pulse flex items-center space-x-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Loading audio...</span>
          </div>
        </div>
      )}
    </div>
  );
}