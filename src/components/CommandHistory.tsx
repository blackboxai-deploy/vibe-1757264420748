"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommandEntry {
  id: string;
  command: string;
  type: 'voice' | 'text' | 'system';
  response?: string;
  timestamp: Date;
  status: 'success' | 'error' | 'processing';
}

interface CommandHistoryProps {
  isVisible: boolean;
  onToggle: () => void;
  onReplayCommand?: (command: string) => void;
}

export default function CommandHistory({ 
  isVisible, 
  onToggle, 
  onReplayCommand 
}: CommandHistoryProps) {
  const [history, setHistory] = useState<CommandEntry[]>([
    {
      id: '1',
      command: 'Initialize JARVIS systems',
      type: 'system',
      response: 'All systems online. JARVIS is ready for operation.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success'
    },
    {
      id: '2',
      command: 'Show weather forecast',
      type: 'voice',
      response: 'Weather data retrieved successfully. Displaying current conditions and 5-day forecast.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      status: 'success'
    },
    {
      id: '3',
      command: 'Run system diagnostics',
      type: 'text',
      response: 'System diagnostics complete. All components functioning within normal parameters.',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      status: 'success'
    }
  ]);
  const [filter, setFilter] = useState<'all' | 'voice' | 'text' | 'system'>('all');

  // Function to add new command to history
  const addCommand = (command: string, type: CommandEntry['type'], response?: string, status: CommandEntry['status'] = 'processing') => {
    const newEntry: CommandEntry = {
      id: Date.now().toString(),
      command,
      type,
      response,
      timestamp: new Date(),
      status
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep only last 50 entries
    return newEntry.id;
  };

  // Function to update command status/response
  const updateCommand = (id: string, response: string, status: CommandEntry['status']) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, response, status } : entry
    ));
  };

  // Expose functions globally for other components to use
  useEffect(() => {
    (window as any).jarvisAddCommand = addCommand;
    (window as any).jarvisUpdateCommand = updateCommand;
    
    return () => {
      delete (window as any).jarvisAddCommand;
      delete (window as any).jarvisUpdateCommand;
    };
  }, []);

  const filteredHistory = history.filter(entry => 
    filter === 'all' || entry.type === filter
  );

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'voice': return '🎤';
      case 'text': return '💬';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'voice': return 'text-blue-400 bg-blue-400/20';
      case 'text': return 'text-green-400 bg-green-400/20';
      case 'system': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const exportHistory = () => {
    const historyData = {
      exportDate: new Date().toISOString(),
      entries: history
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">COMMAND HISTORY</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-yellow-400/80">
            {history.length} commands logged
          </div>
          <Button
            onClick={exportHistory}
            variant="outline"
            size="sm"
            className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20"
          >
            Export
          </Button>
          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            className="border-orange-400/50 text-orange-400 hover:bg-orange-400/20"
          >
            Clear
          </Button>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-400/20"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'voice', 'text', 'system'].map((filterType) => (
          <Button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            className={`${
              filter === filterType
                ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
                : 'border-yellow-400/50 text-yellow-400/80 hover:bg-yellow-400/10'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType !== 'all' && (
              <span className="ml-2">
                ({history.filter(h => h.type === filterType).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* History List */}
      <Card className="bg-black/40 border-yellow-400/30 hologram-effect">
        <div className="p-4 border-b border-yellow-400/30">
          <h3 className="text-lg font-semibold text-yellow-400">
            Command Log ({filteredHistory.length})
          </h3>
        </div>

        <ScrollArea className="h-96 p-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-yellow-400/60 text-lg mb-2">No commands found</div>
              <div className="text-yellow-400/40 text-sm">
                {filter === 'all' 
                  ? 'Command history will appear here as you interact with JARVIS'
                  : `No ${filter} commands available`
                }
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-black/30 rounded border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 slide-in"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getTypeColor(entry.type)}`}>
                          {entry.type.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(entry.status)}`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-yellow-400/60">
                      <span>{formatTime(entry.timestamp)}</span>
                      <span>•</span>
                      <span>{entry.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-yellow-400/80 text-sm font-semibold mb-1">Command:</div>
                      <div className="text-yellow-100 font-mono text-sm bg-black/40 p-2 rounded">
                        "{entry.command}"
                      </div>
                    </div>

                    {entry.response && (
                      <div>
                        <div className="text-yellow-400/80 text-sm font-semibold mb-1">Response:</div>
                        <div className="text-yellow-400/90 text-sm bg-black/40 p-2 rounded">
                          {entry.response}
                        </div>
                      </div>
                    )}

                    {entry.status === 'processing' && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150" />
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}

                    {onReplayCommand && entry.status === 'success' && (
                      <div className="pt-2 border-t border-yellow-400/20">
                        <Button
                          onClick={() => onReplayCommand(entry.command)}
                          variant="outline"
                          size="sm"
                          className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20 text-xs"
                        >
                          Replay Command
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}