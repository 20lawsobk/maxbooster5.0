import { useState } from 'react';
import { PeakMeter } from './PeakMeter';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings, Volume2, VolumeX, Circle } from 'lucide-react';
import type { AudioEffect } from '@/hooks/useAudioPlayer';

interface ChannelStripProps {
  trackId: string;
  trackName: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  record?: boolean;
  effects: AudioEffect[];
  getPeakLevel: () => { peak: number; rms: number };
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onRecordToggle?: () => void;
  onAddEffect: () => void;
  onEffectClick: (effectId: string) => void;
  onEffectRemove: (effectId: string) => void;
  onEffectBypass: (effectId: string) => void;
  className?: string;
}

export function ChannelStrip({
  trackId,
  trackName,
  volume,
  pan,
  mute,
  solo,
  record = false,
  effects,
  getPeakLevel,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onRecordToggle,
  onAddEffect,
  onEffectClick,
  onEffectRemove,
  onEffectBypass,
  className = '',
}: ChannelStripProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(trackName);

  const handleNameSave = () => {
    setIsEditingName(false);
    // TODO: Save track name
  };

  return (
    <div 
      className={`flex flex-col items-center gap-3 p-3 bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-700 w-32 ${className}`}
      data-testid={`channel-strip-${trackId}`}
    >
      {/* Track Name */}
      <div className="w-full text-center">
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            className="h-6 text-xs text-center"
            autoFocus
            data-testid={`input-track-name-${trackId}`}
          />
        ) : (
          <div
            className="text-xs font-medium text-gray-200 dark:text-gray-300 truncate cursor-pointer hover:bg-gray-700 rounded px-1"
            onClick={() => setIsEditingName(true)}
            data-testid={`text-track-name-${trackId}`}
          >
            {trackName}
          </div>
        )}
      </div>

      {/* Input Gain Knob (simplified as slider for now) */}
      <div className="w-full">
        <div className="text-[10px] text-gray-400 text-center mb-1">GAIN</div>
        <Slider
          value={[1]}
          min={0}
          max={2}
          step={0.01}
          className="w-full"
          data-testid={`slider-gain-${trackId}`}
        />
      </div>

      {/* Peak Meter */}
      <div className="flex justify-center my-2">
        <PeakMeter getLevel={getPeakLevel} height={120} width={20} />
      </div>

      {/* Effects Rack */}
      <div className="w-full flex flex-col gap-1">
        <div className="text-[10px] text-gray-400 text-center mb-1">EFFECTS</div>
        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {effects.map((effect) => (
            <div
              key={effect.id}
              className={`relative group flex items-center justify-between px-2 py-1 rounded text-[10px] cursor-pointer transition-colors ${
                effect.bypass
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              onClick={() => onEffectClick(effect.id)}
              data-testid={`effect-${effect.id}`}
            >
              <span className="truncate flex-1">{effect.type.toUpperCase()}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  className="text-[8px] hover:text-yellow-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEffectBypass(effect.id);
                  }}
                  data-testid={`button-bypass-${effect.id}`}
                >
                  {effect.bypass ? '○' : '●'}
                </button>
                <button
                  className="text-[8px] hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEffectRemove(effect.id);
                  }}
                  data-testid={`button-remove-${effect.id}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-6 text-[10px]"
          onClick={onAddEffect}
          data-testid={`button-add-effect-${trackId}`}
        >
          <Plus className="w-3 h-3 mr-1" />
          FX
        </Button>
      </div>

      {/* Send Knobs (placeholder for future) */}
      <div className="w-full">
        <div className="text-[10px] text-gray-400 text-center mb-1">SENDS</div>
        <div className="flex gap-2 justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[8px]">
              R
            </div>
            <div className="text-[8px] text-gray-500">0%</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[8px]">
              D
            </div>
            <div className="text-[8px] text-gray-500">0%</div>
          </div>
        </div>
      </div>

      {/* Pan Knob */}
      <div className="w-full">
        <div className="text-[10px] text-gray-400 text-center mb-1">PAN</div>
        <Slider
          value={[pan]}
          min={-1}
          max={1}
          step={0.01}
          onValueChange={([value]) => onPanChange(value)}
          className="w-full"
          data-testid={`slider-pan-${trackId}`}
        />
        <div className="text-[8px] text-gray-500 text-center mt-1">
          {pan === 0 ? 'C' : pan < 0 ? `L${Math.abs(pan * 100).toFixed(0)}` : `R${(pan * 100).toFixed(0)}`}
        </div>
      </div>

      {/* Volume Fader */}
      <div className="w-full flex-1 flex flex-col items-center">
        <div className="text-[10px] text-gray-400 text-center mb-1">VOLUME</div>
        <div className="relative flex-1 w-full flex justify-center">
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([value]) => onVolumeChange(value)}
            orientation="vertical"
            className="h-32"
            data-testid={`slider-volume-${trackId}`}
          />
        </div>
        <div className="text-[8px] text-gray-500 text-center mt-1">
          {(volume * 100).toFixed(0)}%
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full flex justify-center gap-1">
        <Button
          variant={mute ? 'destructive' : 'outline'}
          size="sm"
          className="w-8 h-8 p-0"
          onClick={onMuteToggle}
          data-testid={`button-mute-${trackId}`}
        >
          {mute ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </Button>
        <Button
          variant={solo ? 'default' : 'outline'}
          size="sm"
          className="w-8 h-8 p-0"
          onClick={onSoloToggle}
          data-testid={`button-solo-${trackId}`}
        >
          S
        </Button>
        {onRecordToggle && (
          <Button
            variant={record ? 'destructive' : 'outline'}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onRecordToggle}
            data-testid={`button-record-${trackId}`}
          >
            <Circle className={`w-3 h-3 ${record ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
