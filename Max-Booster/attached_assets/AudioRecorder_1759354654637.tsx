import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, Square, Upload, Trash2, Clock, FileAudio } from 'lucide-react';

interface AudioRecorderProps {
  trackId?: string;
  onRecordingComplete?: (blob: Blob, analysis: any) => void;
}

export default function AudioRecorder({ trackId, onRecordingComplete }: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const {
    isRecording,
    isPlaying,
    isPaused,
    duration,
    currentTime,
    audioUrl,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playRecording,
    pausePlayback,
    stopPlayback,
    clearRecordings,
    uploadRecording,
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const handleUpload = async () => {
    if (!trackId) return;

    setIsUploading(true);
    try {
      const result = await uploadRecording(trackId);
      if (result && onRecordingComplete) {
        const blob = await fetch(audioUrl!).then((r) => r.blob());
        onRecordingComplete(blob, result.analysis);
      }
    } catch (error) {
      console.error('Failed to upload recording:', error);
      alert('Failed to upload recording. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/50 border-border" data-testid="audio-recorder-unsupported">
        <CardContent className="p-6 text-center">
          <MicOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audio Recording Not Supported</h3>
          <p className="text-muted-foreground">
            Your browser doesn't support audio recording. Please use a modern browser with
            microphone access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border" data-testid="audio-recorder">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Audio Recorder
          </span>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              REC
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Status */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : audioUrl
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/50'
              }`}
            />
            <span className="text-sm font-medium">
              {isRecording ? 'Recording...' : audioUrl ? 'Ready to play' : 'Ready to record'}
            </span>
          </div>

          {/* Duration Display */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid="recording-duration">
              {formatTime(isPlaying ? currentTime : duration)}
            </span>
          </div>
        </div>

        {/* Recording Progress */}
        {(isRecording || duration > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Progress
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              className="h-2"
              data-testid="recording-progress"
            />
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-2">
          {!isRecording && !audioUrl && (
            <Button
              onClick={handleStartRecording}
              variant="destructive"
              size="lg"
              className="px-8"
              data-testid="button-start-recording"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="flex space-x-2">
              {!isPaused ? (
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  data-testid="button-pause-recording"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeRecording}
                  variant="destructive"
                  size="lg"
                  data-testid="button-resume-recording"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}

              <Button
                onClick={stopRecording}
                variant="default"
                size="lg"
                data-testid="button-stop-recording"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {audioUrl && !isRecording && (
            <div className="flex space-x-2">
              <Button
                onClick={isPlaying ? pausePlayback : playRecording}
                variant="outline"
                size="lg"
                data-testid="button-playback-toggle"
              >
                {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                onClick={stopPlayback}
                variant="outline"
                size="lg"
                data-testid="button-stop-playback"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Upload and Management */}
        {audioUrl && !isRecording && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileAudio className="h-4 w-4" />
              <span>Recording ready</span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={clearRecordings}
                variant="outline"
                size="sm"
                data-testid="button-clear-recording"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>

              {trackId && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="sm"
                  data-testid="button-upload-recording"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Add to Track'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground bg-muted/10 p-3 rounded-lg">
          <strong>Tips:</strong> Make sure your microphone is connected and enabled. Recording in a
          quiet environment will give you the best results. The AI will automatically analyze your
          recording for tempo and key.
        </div>
      </CardContent>
    </Card>
  );
}
