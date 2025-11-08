import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Upload, Calendar as CalendarIcon, Music, Image } from "lucide-react";
import { format } from "date-fns";

interface ReleaseManagerProps {
  onSubmit: (releaseData: any) => void;
}

export default function ReleaseManager({ onSubmit }: ReleaseManagerProps) {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    releaseType: "",
    genre: "",
    description: "",
    releaseDate: null as Date | null,
    artwork: null as File | null,
    songs: [] as any[]
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'spotify', 'apple', 'youtube', 'amazon'
  ]);

  const genres = [
    "Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Country", 
    "Jazz", "Classical", "Reggae", "Folk", "Blues", "Punk",
    "Metal", "Alternative", "Indie", "Dance", "House", "Techno"
  ];

  const platforms = [
    { id: 'spotify', name: 'Spotify', icon: '🎵' },
    { id: 'apple', name: 'Apple Music', icon: '🍎' },
    { id: 'youtube', name: 'YouTube Music', icon: '📺' },
    { id: 'amazon', name: 'Amazon Music', icon: '📦' },
    { id: 'tidal', name: 'Tidal', icon: '🌊' },
    { id: 'deezer', name: 'Deezer', icon: '🎶' },
    { id: 'soundcloud', name: 'SoundCloud', icon: '☁️' },
    { id: 'bandcamp', name: 'Bandcamp', icon: '🎪' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleArtworkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, artwork: file }));
    }
  };

  const addSong = () => {
    const newSong = {
      id: Date.now().toString(),
      title: "",
      duration: 0,
      audioFile: null as File | null
    };
    setFormData(prev => ({
      ...prev,
      songs: [...prev.songs, newSong]
    }));
  };

  const updateSong = (index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, ...updates } : song
      )
    }));
  };

  const removeSong = (index: number) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const releaseData = {
      ...formData,
      platforms: selectedPlatforms,
      metadata: {
        upc: generateUPC(),
        isrc: formData.songs.map(() => generateISRC())
      }
    };
    
    onSubmit(releaseData);
  };

  const generateUPC = () => {
    return '1234567890123'; // Mock UPC generation
  };

  const generateISRC = () => {
    return 'USRC17607839'; // Mock ISRC generation
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Release Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter release title"
            required
            data-testid="input-release-title"
          />
        </div>
        
        <div>
          <Label htmlFor="artist">Artist Name *</Label>
          <Input
            id="artist"
            value={formData.artist}
            onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
            placeholder="Enter artist name"
            required
            data-testid="input-artist-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="releaseType">Release Type *</Label>
          <Select value={formData.releaseType} onValueChange={(value) => setFormData(prev => ({ ...prev, releaseType: value }))}>
            <SelectTrigger data-testid="select-release-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="ep">EP</SelectItem>
              <SelectItem value="album">Album</SelectItem>
              <SelectItem value="compilation">Compilation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="genre">Genre</Label>
          <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
            <SelectTrigger data-testid="select-genre">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre.toLowerCase()}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Release Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid="button-release-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.releaseDate ? format(formData.releaseDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.releaseDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, releaseDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your release..."
          className="min-h-20"
          data-testid="textarea-description"
        />
      </div>

      {/* Artwork Upload */}
      <div>
        <Label>Artwork</Label>
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6">
            <div className="text-center">
              {formData.artwork ? (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-accent" />
                  <p className="text-sm">{formData.artwork.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, artwork: null }))}
                    data-testid="button-remove-artwork"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm">Upload artwork</p>
                    <p className="text-xs text-muted-foreground">3000x3000px minimum, JPG or PNG</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkUpload}
                    className="hidden"
                    id="artwork-upload"
                    data-testid="input-artwork"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('artwork-upload')?.click()}
                    data-testid="button-upload-artwork"
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Songs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Songs</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSong}
            data-testid="button-add-song"
          >
            <Music className="w-4 h-4 mr-1" />
            Add Song
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.songs.map((song, index) => (
            <Card key={song.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Song Title</Label>
                    <Input
                      value={song.title}
                      onChange={(e) => updateSong(index, { title: e.target.value })}
                      placeholder="Enter song title"
                      data-testid={`input-song-title-${index}`}
                    />
                  </div>
                  
                  <div>
                    <Label>Audio File</Label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => updateSong(index, { audioFile: e.target.files?.[0] })}
                      className="w-full text-sm"
                      data-testid={`input-song-file-${index}`}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSong(index)}
                      data-testid={`button-remove-song-${index}`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div>
        <Label>Distribution Platforms</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {platforms.map((platform) => (
            <Card
              key={platform.id}
              className={`cursor-pointer transition-colors ${
                selectedPlatforms.includes(platform.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => togglePlatform(platform.id)}
              data-testid={`platform-${platform.id}`}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">{platform.icon}</div>
                <p className="text-sm font-medium">{platform.name}</p>
                {selectedPlatforms.includes(platform.id) && (
                  <Badge className="mt-1" size="sm">Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" data-testid="button-save-draft">
          Save Draft
        </Button>
        <Button type="submit" data-testid="button-create-release">
          Create Release
        </Button>
      </div>
    </form>
  );
}
