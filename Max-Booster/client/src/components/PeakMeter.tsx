import { useEffect, useRef, useState } from 'react';

interface PeakMeterProps {
  getLevel: () => { peak: number; rms: number };
  height?: number;
  width?: number;
  orientation?: 'vertical' | 'horizontal';
}

export function PeakMeter({ 
  getLevel, 
  height = 120, 
  width = 20,
  orientation = 'vertical' 
}: PeakMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const peakHoldRef = useRef<number>(-60);
  const peakHoldTimeRef = useRef<number>(0);
  const [isClipping, setIsClipping] = useState(false);
  const clipTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      const { peak, rms } = getLevel();
      const currentTime = Date.now();

      // Update peak hold
      if (peak > peakHoldRef.current) {
        peakHoldRef.current = peak;
        peakHoldTimeRef.current = currentTime;
      } else if (currentTime - peakHoldTimeRef.current > 1500) {
        // Decay peak hold after 1.5 seconds
        peakHoldRef.current = Math.max(peakHoldRef.current - 0.5, peak);
      }

      // Check for clipping
      if (peak > 0) {
        setIsClipping(true);
        clipTimeRef.current = currentTime;
      } else if (currentTime - clipTimeRef.current > 1000) {
        setIsClipping(false);
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);

      if (orientation === 'vertical') {
        drawVerticalMeter(ctx, peak, rms, peakHoldRef.current, width, height);
      } else {
        drawHorizontalMeter(ctx, peak, rms, peakHoldRef.current, width, height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getLevel, width, height, orientation]);

  return (
    <div className="relative flex flex-col items-center" data-testid="peak-meter">
      <canvas
        ref={canvasRef}
        className="rounded"
        style={{ 
          width: orientation === 'vertical' ? `${width}px` : `${width}px`,
          height: orientation === 'vertical' ? `${height}px` : `${height}px`
        }}
      />
      {isClipping && (
        <div 
          className="absolute -top-6 w-full text-center text-xs font-bold text-red-500 animate-pulse"
          data-testid="clip-indicator"
        >
          CLIP
        </div>
      )}
    </div>
  );
}

function drawVerticalMeter(
  ctx: CanvasRenderingContext2D,
  peak: number,
  rms: number,
  peakHold: number,
  width: number,
  height: number
) {
  // Convert dB to pixel height (range: -60dB to +6dB)
  const dbToHeight = (db: number) => {
    const normalized = (db + 60) / 66; // Map -60 to 0, +6 to 1
    return Math.max(0, Math.min(1, normalized)) * height;
  };

  const peakHeight = dbToHeight(peak);
  const rmsHeight = dbToHeight(rms);
  const peakHoldHeight = dbToHeight(peakHold);

  // Draw background segments with color zones
  const segments = 20;
  const segmentHeight = height / segments;
  const segmentGap = 1;

  for (let i = 0; i < segments; i++) {
    const y = height - (i + 1) * segmentHeight;
    const db = ((i + 1) / segments) * 66 - 60; // Map to dB range

    // Determine color based on dB level
    let color: string;
    if (db < -18) {
      color = '#22c55e'; // Green
    } else if (db < -6) {
      color = '#eab308'; // Yellow
    } else {
      color = '#ef4444'; // Red
    }

    // Check if this segment should be lit
    if ((i + 1) * segmentHeight <= rmsHeight) {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = '#2a2a2a'; // Dark gray for off segments
    }

    ctx.fillRect(0, y, width, segmentHeight - segmentGap);
  }

  // Draw peak indicator (brighter overlay)
  if (peakHeight > 0) {
    const peakY = height - peakHeight;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, peakY, width, 2);
  }

  // Draw peak hold line
  if (peakHoldHeight > 0) {
    const holdY = height - peakHoldHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, holdY, width, 2);
  }

  // Draw dB scale markers (every 12dB)
  ctx.fillStyle = '#666';
  ctx.font = '8px monospace';
  const markers = [0, -12, -24, -36, -48, -60];
  markers.forEach(db => {
    const y = height - dbToHeight(db);
    ctx.fillRect(width - 3, y, 3, 1);
  });
}

function drawHorizontalMeter(
  ctx: CanvasRenderingContext2D,
  peak: number,
  rms: number,
  peakHold: number,
  width: number,
  height: number
) {
  // Convert dB to pixel width (range: -60dB to +6dB)
  const dbToWidth = (db: number) => {
    const normalized = (db + 60) / 66; // Map -60 to 0, +6 to 1
    return Math.max(0, Math.min(1, normalized)) * width;
  };

  const peakWidth = dbToWidth(peak);
  const rmsWidth = dbToWidth(rms);
  const peakHoldWidth = dbToWidth(peakHold);

  // Draw background segments with color zones
  const segments = 30;
  const segmentWidth = width / segments;
  const segmentGap = 1;

  for (let i = 0; i < segments; i++) {
    const x = i * segmentWidth;
    const db = ((i + 1) / segments) * 66 - 60; // Map to dB range

    // Determine color based on dB level
    let color: string;
    if (db < -18) {
      color = '#22c55e'; // Green
    } else if (db < -6) {
      color = '#eab308'; // Yellow
    } else {
      color = '#ef4444'; // Red
    }

    // Check if this segment should be lit
    if ((i + 1) * segmentWidth <= rmsWidth) {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = '#2a2a2a'; // Dark gray for off segments
    }

    ctx.fillRect(x, 0, segmentWidth - segmentGap, height);
  }

  // Draw peak indicator (brighter overlay)
  if (peakWidth > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(peakWidth, 0, 2, height);
  }

  // Draw peak hold line
  if (peakHoldWidth > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(peakHoldWidth, 0, 2, height);
  }
}
