import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Square,
  Grid,
  Music,
  Pencil,
  Eraser,
  ZoomIn,
  ZoomOut,
  Scissors,
  Copy,
  Trash2,
} from 'lucide-react';

interface MIDINote {
  id: string;
  pitch: number; // 0-127 (MIDI note number)
  startTime: number; // in beats
  duration: number; // in beats
  velocity: number; // 0-127
}

interface PianoRollProps {
  trackId: string;
  notes: MIDINote[];
  onNotesChange: (notes: MIDINote[]) => void;
  isPlaying?: boolean;
  currentTime?: number; // in beats
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_HEIGHT = 20;
const BEATS_PER_MEASURE = 4;
const TOTAL_OCTAVES = 10;
const TOTAL_NOTES = TOTAL_OCTAVES * 12;

/**
 * TODO: Add function documentation
 */
export function PianoRoll({
  trackId,
  notes,
  onNotesChange,
  isPlaying = false,
  currentTime = 0,
}: PianoRollProps) {
  const [tool, setTool] = useState<'pencil' | 'select' | 'eraser'>('pencil');
  const [zoom, setZoom] = useState(100);
  const [snapValue, setSnapValue] = useState<number>(0.25); // 1/16th note
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  const beatsPerPixel = 0.1 / (zoom / 100);
  const visibleBeats = 64; // 16 measures
  const canvasWidth = Math.max(1200, visibleBeats / beatsPerPixel);
  const canvasHeight = TOTAL_NOTES * NOTE_HEIGHT;

  // Get note name from MIDI number
  const getNoteName = (midiNumber: number): string => {
    const octave = Math.floor(midiNumber / 12) - 1;
    const note = NOTE_NAMES[midiNumber % 12];
    return `${note}${octave}`;
  };

  // Snap time to grid
  const snapToGrid = (time: number): number => {
    if (snapValue === 0) return time;
    return Math.round(time / snapValue) * snapValue;
  };

  // Add new note
  const addNote = useCallback(
    (pitch: number, startTime: number) => {
      const newNote: MIDINote = {
        id: `note-${Date.now()}-${Math.random()}`,
        pitch,
        startTime: snapToGrid(startTime),
        duration: snapValue,
        velocity: 100,
      };
      onNotesChange([...notes, newNote]);
    },
    [notes, onNotesChange, snapValue]
  );

  // Delete note
  const deleteNote = useCallback(
    (noteId: string) => {
      onNotesChange(notes.filter((n) => n.id !== noteId));
    },
    [notes, onNotesChange]
  );

  // Update note
  const updateNote = useCallback(
    (noteId: string, updates: Partial<MIDINote>) => {
      onNotesChange(notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n)));
    },
    [notes, onNotesChange]
  );

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = x * beatsPerPixel;
    const pitch = TOTAL_NOTES - Math.floor(y / NOTE_HEIGHT) - 1;

    if (tool === 'pencil') {
      // Check if clicking on existing note
      const clickedNote = notes.find((note) => {
        const noteStartX = note.startTime / beatsPerPixel;
        const noteEndX = (note.startTime + note.duration) / beatsPerPixel;
        const noteY = (TOTAL_NOTES - note.pitch - 1) * NOTE_HEIGHT;

        return x >= noteStartX && x <= noteEndX && y >= noteY && y <= noteY + NOTE_HEIGHT;
      });

      if (clickedNote) {
        deleteNote(clickedNote.id);
      } else {
        addNote(pitch, time);
      }
    } else if (tool === 'eraser') {
      const clickedNote = notes.find((note) => {
        const noteStartX = note.startTime / beatsPerPixel;
        const noteEndX = (note.startTime + note.duration) / beatsPerPixel;
        const noteY = (TOTAL_NOTES - note.pitch - 1) * NOTE_HEIGHT;

        return x >= noteStartX && x <= noteEndX && y >= noteY && y <= noteY + NOTE_HEIGHT;
      });

      if (clickedNote) {
        deleteNote(clickedNote.id);
      }
    }
  };

  // Draw piano roll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (horizontal - note rows)
    for (let i = 0; i <= TOTAL_NOTES; i++) {
      const y = i * NOTE_HEIGHT;
      const isBlackKey = [1, 3, 6, 8, 10].includes(i % 12);

      // Alternate row colors
      if (isBlackKey) {
        ctx.fillStyle = '#151515';
        ctx.fillRect(0, y, canvas.width, NOTE_HEIGHT);
      }

      // Note separator
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      // Octave separator
      if (i % 12 === 0) {
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw grid lines (vertical - beats)
    const gridSpacing = 1 / beatsPerPixel; // 1 beat
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      const beat = x * beatsPerPixel;
      const isMeasure = beat % BEATS_PER_MEASURE === 0;

      ctx.strokeStyle = isMeasure ? '#404040' : '#252525';
      ctx.lineWidth = isMeasure ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw notes
    notes.forEach((note) => {
      const x = note.startTime / beatsPerPixel;
      const y = (TOTAL_NOTES - note.pitch - 1) * NOTE_HEIGHT;
      const width = note.duration / beatsPerPixel;
      const height = NOTE_HEIGHT - 2;

      const isSelected = selectedNotes.has(note.id);

      // Note background
      const opacity = note.velocity / 127;
      ctx.fillStyle = isSelected
        ? `rgba(96, 165, 250, ${opacity})`
        : `rgba(74, 222, 128, ${opacity})`;
      ctx.fillRect(x, y + 1, width, height);

      // Note border
      ctx.strokeStyle = isSelected ? '#60a5fa' : '#4ade80';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y + 1, width, height);

      // Note name (if wide enough)
      if (width > 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(getNoteName(note.pitch), x + 4, y + 14);
      }
    });

    // Draw playhead
    if (isPlaying && currentTime > 0) {
      const x = currentTime / beatsPerPixel;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }, [notes, beatsPerPixel, selectedNotes, isPlaying, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNotes.size > 0) {
          onNotesChange(notes.filter((n) => !selectedNotes.has(n.id)));
          setSelectedNotes(new Set());
        }
      } else if (e.key === 'Escape') {
        setSelectedNotes(new Set());
      } else if (e.key === '1') {
        setTool('pencil');
      } else if (e.key === '2') {
        setTool('select');
      } else if (e.key === '3') {
        setTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNotes, notes, onNotesChange]);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'var(--studio-bg-medium)',
        borderTop: '1px solid var(--studio-border)',
      }}
    >
      {/* Toolbar */}
      <div
        className="h-12 px-4 flex items-center gap-4 border-b"
        style={{ borderColor: 'var(--studio-border)' }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant={tool === 'pencil' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('pencil')}
            className="h-8"
            title="Pencil Tool (1)"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('select')}
            className="h-8"
            title="Select Tool (2)"
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('eraser')}
            className="h-8"
            title="Eraser Tool (3)"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Snap:</span>
          <Select value={snapValue.toString()} onValueChange={(v) => setSnapValue(parseFloat(v))}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Off</SelectItem>
              <SelectItem value="0.0625">1/64</SelectItem>
              <SelectItem value="0.125">1/32</SelectItem>
              <SelectItem value="0.25">1/16</SelectItem>
              <SelectItem value="0.5">1/8</SelectItem>
              <SelectItem value="1">1/4</SelectItem>
              <SelectItem value="2">1/2</SelectItem>
              <SelectItem value="4">Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(25, zoom - 25))}
            className="h-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-16 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(400, zoom + 25))}
            className="h-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (selectedNotes.size > 0) {
                onNotesChange(notes.filter((n) => !selectedNotes.has(n.id)));
                setSelectedNotes(new Set());
              }
            }}
            disabled={selectedNotes.size === 0}
            className="h-8"
            title="Delete Selected (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {notes.length} notes {selectedNotes.size > 0 && `(${selectedNotes.size} selected)`}
          </span>
        </div>
      </div>

      {/* Piano Roll Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Piano Keys */}
        <div
          className="w-16 flex-shrink-0 overflow-hidden border-r"
          style={{
            borderColor: 'var(--studio-border)',
            background: 'var(--studio-bg-deep)',
          }}
        >
          <div style={{ height: canvasHeight }}>
            {Array.from({ length: TOTAL_NOTES }).map((_, i) => {
              const pitch = TOTAL_NOTES - i - 1;
              const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12);
              const isC = pitch % 12 === 0;

              return (
                <div
                  key={i}
                  className="flex items-center justify-end px-2 border-b"
                  style={{
                    height: `${NOTE_HEIGHT}px`,
                    background: isBlackKey ? '#252525' : '#1a1a1a',
                    borderColor: isC ? '#404040' : '#2a2a2a',
                    borderWidth: isC ? '2px 0' : '1px 0',
                  }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: isC ? 'var(--studio-text)' : 'var(--studio-text-muted)',
                      fontWeight: isC ? 600 : 400,
                    }}
                  >
                    {getNoteName(pitch)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-auto" ref={gridRef}>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              className="cursor-crosshair"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
