import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, Trash2, RotateCcw, Volume2, Zap, Waves, Filter, Mic } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  enabled: boolean;
  parameters: Record<string, number>;
  presets?: string[];
}

interface Track {
  id: string;
  name: string;
  plugins?: Plugin[];
}

interface PluginRackProps {
  selectedTrack: string | null;
  tracks: Track[];
  onPluginUpdate: (trackId: string, pluginData: any) => void;
}

export default function PluginRack({ selectedTrack, tracks, onPluginUpdate }: PluginRackProps) {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  const currentTrack = tracks.find((t) => t.id === selectedTrack);
  const currentPlugins = currentTrack?.plugins || [];

  const availablePlugins = [
    {
      id: 'mb-eq8',
      name: 'MB EQ8',
      type: 'Equalizer',
      manufacturer: 'Max Booster',
      icon: <Filter className="w-6 h-6" />,
      color: 'text-primary',
    },
    {
      id: 'mb-comp',
      name: 'MB Compressor',
      type: 'Dynamics',
      manufacturer: 'Max Booster',
      icon: <Waves className="w-6 h-6" />,
      color: 'text-secondary',
    },
    {
      id: 'mb-reverb',
      name: 'MB Reverb',
      type: 'Reverb',
      manufacturer: 'Max Booster',
      icon: <Volume2 className="w-6 h-6" />,
      color: 'text-accent',
    },
    {
      id: 'mb-delay',
      name: 'MB Delay',
      type: 'Delay',
      manufacturer: 'Max Booster',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-primary',
    },
    {
      id: 'mb-distortion',
      name: 'MB Distortion',
      type: 'Saturation',
      manufacturer: 'Max Booster',
      icon: <Waves className="w-6 h-6" />,
      color: 'text-destructive',
    },
    {
      id: 'mb-chorus',
      name: 'MB Chorus',
      type: 'Modulation',
      manufacturer: 'Max Booster',
      icon: <Volume2 className="w-6 h-6" />,
      color: 'text-accent',
    },
  ];

  const addPlugin = (pluginId: string) => {
    if (!selectedTrack) return;

    const pluginTemplate = availablePlugins.find((p) => p.id === pluginId);
    if (!pluginTemplate) return;

    const newPlugin: Plugin = {
      id: `${pluginId}-${Date.now()}`,
      name: pluginTemplate.name,
      type: pluginTemplate.type,
      manufacturer: pluginTemplate.manufacturer,
      enabled: true,
      parameters: getDefaultParameters(pluginId),
    };

    onPluginUpdate(selectedTrack, {
      action: 'add',
      plugin: newPlugin,
    });
  };

  const removePlugin = (pluginId: string) => {
    if (!selectedTrack) return;

    onPluginUpdate(selectedTrack, {
      action: 'remove',
      pluginId,
    });
  };

  const updatePluginParameter = (pluginId: string, parameter: string, value: number) => {
    if (!selectedTrack) return;

    onPluginUpdate(selectedTrack, {
      action: 'updateParameter',
      pluginId,
      parameter,
      value,
    });
  };

  const togglePlugin = (pluginId: string) => {
    if (!selectedTrack) return;

    const plugin = currentPlugins.find((p) => p.id === pluginId);
    if (plugin) {
      onPluginUpdate(selectedTrack, {
        action: 'toggle',
        pluginId,
        enabled: !plugin.enabled,
      });
    }
  };

  const getDefaultParameters = (pluginType: string): Record<string, number> => {
    switch (pluginType) {
      case 'mb-eq8':
        return {
          lowCut: 20,
          lowGain: 0,
          lowMidGain: 0,
          midGain: 0,
          highMidGain: 0,
          highGain: 0,
          highCut: 20000,
        };
      case 'mb-comp':
        return {
          threshold: -12,
          ratio: 3,
          attack: 10,
          release: 100,
          gain: 0,
        };
      case 'mb-reverb':
        return {
          roomSize: 50,
          damping: 50,
          wetness: 20,
          width: 100,
        };
      case 'mb-delay':
        return {
          time: 250,
          feedback: 25,
          wetness: 20,
          sync: 0,
        };
      case 'mb-distortion':
        return {
          drive: 50,
          tone: 50,
          level: 50,
          mix: 100,
        };
      case 'mb-chorus':
        return {
          rate: 0.5,
          depth: 50,
          feedback: 10,
          mix: 30,
        };
      default:
        return {};
    }
  };

  const renderPluginControls = (plugin: Plugin) => {
    const controls = [];

    for (const [param, value] of Object.entries(plugin.parameters)) {
      controls.push(
        <div key={param} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize">
              {param.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </label>
            <span className="text-sm font-mono">{formatParameterValue(param, value)}</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={(newValue) => updatePluginParameter(plugin.id, param, newValue[0])}
            max={getParameterMax(param)}
            min={getParameterMin(param)}
            step={getParameterStep(param)}
            className="w-full"
            data-testid={`slider-${plugin.id}-${param}`}
          />
        </div>
      );
    }

    return controls;
  };

  const formatParameterValue = (param: string, value: number): string => {
    if (param.includes('gain') || param === 'threshold') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}dB`;
    }
    if (param.includes('time') || param === 'attack' || param === 'release') {
      return `${value.toFixed(0)}ms`;
    }
    if (param.includes('ratio')) {
      return `${value.toFixed(1)}:1`;
    }
    if (param.includes('frequency') || param.includes('Cut')) {
      return `${value.toFixed(0)}Hz`;
    }
    return `${value.toFixed(1)}`;
  };

  const getParameterMax = (param: string): number => {
    if (param.includes('gain')) return 24;
    if (param === 'threshold') return 0;
    if (param === 'ratio') return 20;
    if (param.includes('Cut')) return 20000;
    if (param === 'time') return 2000;
    if (param === 'attack') return 100;
    if (param === 'release') return 1000;
    return 100;
  };

  const getParameterMin = (param: string): number => {
    if (param.includes('gain') || param === 'threshold') return -24;
    if (param === 'ratio') return 1;
    if (param.includes('Cut')) return 20;
    return 0;
  };

  const getParameterStep = (param: string): number => {
    if (param.includes('frequency') || param.includes('Cut')) return 10;
    if (param === 'ratio') return 0.1;
    return 1;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Plugin Rack
          {currentTrack && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              - {currentTrack.name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        {!selectedTrack ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Select a track to view plugins</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="rack" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rack" data-testid="tab-plugin-rack">
                Plugin Rack
              </TabsTrigger>
              <TabsTrigger value="browser" data-testid="tab-plugin-browser">
                Browser
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rack" className="flex-1 space-y-4">
              {currentPlugins.length > 0 ? (
                <div className="space-y-4">
                  {currentPlugins.map((plugin, index) => (
                    <Card
                      key={plugin.id}
                      className={`${!plugin.enabled ? 'opacity-50' : ''} transition-opacity`}
                      data-testid={`plugin-${plugin.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <Settings className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{plugin.name}</h4>
                              <p className="text-sm text-muted-foreground">{plugin.type}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={plugin.enabled}
                              onCheckedChange={() => togglePlugin(plugin.id)}
                              data-testid={`switch-plugin-${plugin.id}`}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePlugin(plugin.id)}
                              data-testid={`button-remove-plugin-${plugin.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div
                          className={`grid grid-cols-2 gap-4 ${
                            selectedPlugin === plugin.id ? 'block' : ''
                          }`}
                        >
                          {renderPluginControls(plugin)}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Reset to default parameters
                              const defaultParams = getDefaultParameters(
                                plugin.id.split('-')[0] + '-' + plugin.id.split('-')[1]
                              );
                              for (const [param, value] of Object.entries(defaultParams)) {
                                updatePluginParameter(plugin.id, param, value);
                              }
                            }}
                            data-testid={`button-reset-plugin-${plugin.id}`}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedPlugin(selectedPlugin === plugin.id ? null : plugin.id)
                            }
                            data-testid={`button-expand-plugin-${plugin.id}`}
                          >
                            {selectedPlugin === plugin.id ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm">No plugins loaded</p>
                    <p className="text-xs">Add plugins from the browser tab</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="browser" className="flex-1">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {availablePlugins.map((plugin) => (
                    <Card
                      key={plugin.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => addPlugin(plugin.id)}
                      data-testid={`available-plugin-${plugin.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 bg-muted/20 rounded ${plugin.color}`}>
                              {plugin.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{plugin.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {plugin.type} • {plugin.manufacturer}
                              </p>
                            </div>
                          </div>

                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
