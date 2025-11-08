import { useEffect, useRef, useMemo } from 'react';

interface WaveformCanvasProps {
  waveformData: number[];
  color: string;
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
  gain?: number;
  offset?: number;
}

export function WaveformCanvas({
  waveformData,
  color,
  width,
  height,
  startTime,
  endTime,
  duration,
  fadeIn = 0,
  fadeOut = 0,
  gain = 1,
  offset = 0,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const visibleWaveform = useMemo(() => {
    const clipDuration = endTime - startTime;
    const startSample = Math.floor((offset / duration) * waveformData.length);
    const endSample = Math.floor(((offset + clipDuration) / duration) * waveformData.length);
    return waveformData.slice(startSample, endSample);
  }, [waveformData, startTime, endTime, offset, duration]);

  const clipDuration = useMemo(() => endTime - startTime, [endTime, startTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (visibleWaveform.length === 0) return;

    // Draw waveform
    const barWidth = width / visibleWaveform.length;
    
    visibleWaveform.forEach((amplitude, i) => {
      const normalizedAmp = amplitude * gain;
      const barHeight = Math.min(normalizedAmp * height * 0.8, height);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      // Calculate fade envelope
      const timeInClip = (i / visibleWaveform.length) * clipDuration;
      let fadeMultiplier = 1;

      if (fadeIn > 0 && timeInClip < fadeIn) {
        fadeMultiplier = timeInClip / fadeIn;
      } else if (fadeOut > 0 && timeInClip > clipDuration - fadeOut) {
        fadeMultiplier = (clipDuration - timeInClip) / fadeOut;
      }

      // Apply fade to opacity
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + (fadeMultiplier * 0.7);
      ctx.fillRect(x, y, Math.max(barWidth, 1), barHeight);
    });

    // Draw fade curves overlay
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000000';

    if (fadeIn > 0) {
      const fadeInWidth = (fadeIn / clipDuration) * width;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 0);
      ctx.lineTo(fadeInWidth, height);
      ctx.closePath();
      ctx.fill();
    }

    if (fadeOut > 0) {
      const fadeOutWidth = (fadeOut / clipDuration) * width;
      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(width, 0);
      ctx.lineTo(width - fadeOutWidth, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, [visibleWaveform, clipDuration, color, width, height, fadeIn, fadeOut, gain]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
      }}
      data-testid="waveform-canvas"
    />
  );
}
