import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Activity, Wifi, WifiOff, Clock, Music, Upload, Share2 } from 'lucide-react';

interface StatusItem {
  id: string;
  type: 'studio' | 'distribution' | 'social' | 'general';
  message: string;
  status: 'active' | 'pending' | 'completed' | 'error';
  timestamp: Date;
}

export function RealTimeStatus() {
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const { isConnected, connectionStatus, sendMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'status_update') {
        setStatusItems((prev) => [
          {
            id: Date.now().toString(),
            type: message.data.type || 'general',
            message: message.data.message,
            status: message.data.status || 'active',
            timestamp: new Date(),
          },
          ...prev.slice(0, 4), // Keep only 5 most recent
        ]);

        // Auto-show status panel when new updates arrive
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 10000); // Hide after 10 seconds
      }
    },
    onConnect: () => {
      console.log('Real-time status connected');
    },
    onDisconnect: () => {
      console.log('Real-time status disconnected');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/20 text-primary';
      case 'pending':
        return 'bg-secondary/20 text-secondary';
      case 'completed':
        return 'bg-accent/20 text-accent';
      case 'error':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'studio':
        return Music;
      case 'distribution':
        return Upload;
      case 'social':
        return Share2;
      default:
        return Activity;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  // Simulate some real-time updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = [
        { type: 'studio', message: 'AI mix analysis completed', status: 'completed' },
        { type: 'distribution', message: 'Release submitted to Spotify', status: 'pending' },
        { type: 'social', message: 'Post scheduled for 6:00 PM', status: 'active' },
        { type: 'general', message: 'New collaboration request received', status: 'pending' },
      ];

      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];

      if (Math.random() > 0.7) {
        // 30% chance every 5 seconds
        setStatusItems((prev) => [
          {
            id: Date.now().toString(),
            type: randomUpdate.type as any,
            message: randomUpdate.message,
            status: randomUpdate.status as any,
            timestamp: new Date(),
          },
          ...prev.slice(0, 4),
        ]);
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 8000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50" data-testid="realtime-status-container">
      {/* Connection Status Indicator */}
      <div className="flex items-center justify-end mb-2">
        <Badge
          variant="outline"
          className={`${
            isConnected
              ? 'bg-accent/20 text-accent border-accent/20'
              : 'bg-destructive/20 text-destructive border-destructive/20'
          }`}
          data-testid="connection-status"
        >
          {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
          {connectionStatus}
        </Badge>
      </div>

      {/* Status Updates Panel */}
      {(isVisible || statusItems.length > 0) && (
        <Card
          className={`bg-card/95 backdrop-blur-sm border-border shadow-lg transition-all duration-300 w-80 ${
            isVisible ? 'slide-in opacity-100' : 'opacity-75 hover:opacity-100'
          }`}
          data-testid="status-updates-panel"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Live Updates
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
                data-testid="button-close-status"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {statusItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No recent activity
                </div>
              ) : (
                statusItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.type);

                  return (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
                      data-testid={`status-item-${item.id}`}
                    >
                      <div
                        className={`p-1 rounded-full ${getStatusColor(item.status)} status-indicator`}
                      >
                        <StatusIcon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
