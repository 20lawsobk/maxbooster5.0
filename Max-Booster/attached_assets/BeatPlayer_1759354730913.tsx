import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { useAudioContext } from '@/hooks/useAudioContext';
import { Play, Pause, Volume2, VolumeX, Download, AudioWaveform } from 'lucide-react';

interface BeatPlayerProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  duration?: number;
  autoPlay?: boolean;
  showWaveform?: boolean;
  showDownload?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function BeatPlayer({
  audioUrl,
  title,
  artist,
  duration,
  autoPlay = false,
  showWaveform = true,
  showDownload = false,
  onPlay,
  onPause,
  onEnded,
}: BeatPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const { context, analyser, frequencyData, startFrequencyAnalysis, stopFrequencyAnalysis } =
    useAudioContext();
  const animationFrameRef = useRef<number>();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        handlePlay();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [autoPlay, onEnded]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // AudioWaveform generation
  useEffect(() => {
    if (showWaveform && analyser && frequencyData) {
      const generateWaveform = () => {
        analyser.getByteFrequencyData(frequencyData);
        const dataArray = Array.from(frequencyData);

        // Downsample for visualization (take every 4th value)
        const waveform = dataArray.filter((_, index) => index % 4 === 0).slice(0, 64);
        setWaveformData(waveform);

        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(generateWaveform);
        }
      };

      if (isPlaying) {
        generateWaveform();
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, analyser, frequencyData, showWaveform]);

  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (context && context.state === 'suspended') {
        await context.resume();
      }

      await audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();

      if (showWaveform) {
        startFrequencyAnalysis?.();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
    onPause?.();

    if (showWaveform) {
      stopFrequencyAnalysis?.();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = (value[0] / 100) * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="w-full" data-testid="beat-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />

      {/* Compact Player (for marketplace cards) */}
      {!title && (
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          data-testid="button-play-compact"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      )}

      {/* Full Player */}
      {title && (
        <Card className="bg-card/50 border-border" data-testid="beat-player-full">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Track Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm" data-testid="text-player-title">
                    {title}
                  </h4>
                  {artist && (
                    <p className="text-xs text-muted-foreground" data-testid="text-player-artist">
                      {artist}
                    </p>
                  )}
                </div>
                {showDownload && (
                  <Button variant="ghost" size="sm" data-testid="button-download">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* AudioWaveform Visualization */}
              {showWaveform && (
                <div
                  className="h-16 bg-background rounded flex items-end justify-center space-x-0.5 p-2"
                  data-testid="waveform-container"
                >
                  {waveformData.length > 0
                    ? waveformData.map((value, index) => (
                        <div
                          key={index}
                          className="frequency-bar bg-gradient-to-t from-primary via-accent to-secondary rounded-sm opacity-70"
                          style={{
                            height: `${Math.max((value / 255) * 100, 8)}%`,
                            width: '2px',
                          }}
                          data-testid={`waveform-bar-${index}`}
                        />
                      ))
                    : // Static waveform when not playing
                      Array.from({ length: 64 }).map((_, index) => (
                        <div
                          key={index}
                          className="bg-muted/40 rounded-sm"
                          style={{
                            height: `${Math.random() * 60 + 20}%`,
                            width: '2px',
                          }}
                        />
                      ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full"
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={isLoading}
                  data-testid="button-play-full"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>

                <div className="flex-1 space-y-1">
                  <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full"
                    data-testid="slider-progress"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span data-testid="text-current-time">{formatTime(currentTime)}</span>
                    <span data-testid="text-duration">{formatTime(audioDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute} data-testid="button-mute">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-16">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                      data-testid="slider-volume"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
