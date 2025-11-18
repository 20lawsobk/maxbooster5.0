import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders, Zap, Volume2, Plus } from 'lucide-react';

export function DAWInterface() {
  const plugins = [
    { name: 'MB EQ8', type: 'Parametric EQ', icon: Sliders, active: true },
    { name: 'MB Comp', type: 'Compressor', icon: Volume2, active: true },
    { name: 'MB Reverb', type: 'Hall Reverb', icon: Volume2, active: true },
  ];

  return (
    <Card className="bg-card/50 border-border" data-testid="card-plugin-rack">
      <CardHeader>
        <CardTitle className="text-lg">Plugin Rack - Lead Vocal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {plugins.map((plugin, index) => {
            const Icon = plugin.icon;
            return (
              <div
                key={index}
                className="bg-muted/20 rounded p-3 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                data-testid={`plugin-${index}`}
              >
                <div className="w-8 h-8 bg-primary/20 rounded mx-auto mb-2 flex items-center justify-center">
                  <Icon className="text-primary text-xs" />
                </div>
                <p className="text-xs font-medium">{plugin.name}</p>
                <p className="text-xs text-muted-foreground">{plugin.type}</p>
                {plugin.active && (
                  <Badge variant="secondary" className="mt-1 text-xs bg-accent/20 text-accent">
                    Active
                  </Badge>
                )}
              </div>
            );
          })}

          {/* Add Plugin Slot */}
          <div
            className="border-2 border-dashed border-muted rounded p-3 text-center opacity-50 hover:opacity-75 transition-opacity cursor-pointer"
            data-testid="add-plugin-slot"
          >
            <div className="w-8 h-8 bg-muted/20 rounded mx-auto mb-2 flex items-center justify-center">
              <Plus className="text-muted-foreground text-xs" />
            </div>
            <p className="text-xs text-muted-foreground">Add Plugin</p>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="mt-6 p-4 bg-muted/10 rounded-lg" data-testid="ai-assistant-panel">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20"
              data-testid="button-auto-eq"
            >
              Auto EQ
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-secondary/10 text-secondary hover:bg-secondary/20"
              data-testid="button-smart-compress"
            >
              Smart Compress
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-accent/10 text-accent hover:bg-accent/20"
              data-testid="button-enhance-vocals"
            >
              Enhance Vocals
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-muted/20 text-muted-foreground hover:bg-muted/30"
              data-testid="button-analyze-mix"
            >
              Analyze Mix
            </Button>
          </div>

          {/* AI Status */}
          <div className="mt-4 p-3 bg-card/50 rounded border border-border" data-testid="ai-status">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">AI Analysis Complete</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Detected: Pop, 120 BPM, C Major. Suggested EQ adjustments available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
