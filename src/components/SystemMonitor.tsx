"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface SystemStats {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    downlink: number;
    uplink: number;
    rtt: number;
    effectiveType: string;
  };
  processes: Array<{
    name: string;
    cpu: number;
    memory: number;
    status: string;
  }>;
  uptime: number;
  timestamp: string;
}

interface SystemMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function SystemMonitor({ isVisible, onToggle }: SystemMonitorProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/system');
      if (!response.ok) {
        throw new Error('Failed to fetch system stats');
      }
      
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchSystemStats();
      
      // Update every 5 seconds when visible
      const interval = setInterval(fetchSystemStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    if (seconds <= 0) return '0m';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getHealthColor = (percentage: number): string => {
    if (percentage < 60) return 'text-green-400';
    if (percentage < 85) return 'text-yellow-400';
    return 'text-red-400';
  };



  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">SYSTEM MONITOR</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={fetchSystemStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
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

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 p-4 rounded-lg">
          <div className="text-red-400">Error: {error}</div>
        </div>
      )}

      {loading && !stats && (
        <div className="flex items-center justify-center h-40">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-150" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* CPU Stats */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">CPU</h3>
              <div className={`text-sm ${getHealthColor(stats.cpu.usage)}`}>
                {stats.cpu.usage}%
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400/80">Usage</span>
                  <span className="text-yellow-100">{stats.cpu.usage}%</span>
                </div>
                <Progress value={stats.cpu.usage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400/80">Temperature</span>
                  <span className="text-yellow-100">{stats.cpu.temperature}°C</span>
                </div>
                <Progress value={(stats.cpu.temperature / 100) * 100} className="h-2" />
              </div>
              <div className="text-sm text-yellow-400/80">
                Cores: {stats.cpu.cores}
              </div>
            </div>
          </Card>

          {/* Memory Stats */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Memory</h3>
              <div className={`text-sm ${getHealthColor(stats.memory.percentage)}`}>
                {Math.round(stats.memory.percentage)}%
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400/80">Used</span>
                  <span className="text-yellow-100">{formatBytes(stats.memory.used * 1024 * 1024)}</span>
                </div>
                <Progress value={stats.memory.percentage} className="h-2" />
              </div>
              <div className="text-sm text-yellow-400/80">
                Total: {formatBytes(stats.memory.total * 1024 * 1024)}
              </div>
            </div>
          </Card>

          {/* Storage Stats */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Storage</h3>
              <div className={`text-sm ${getHealthColor(stats.storage.percentage)}`}>
                {Math.round(stats.storage.percentage)}%
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400/80">Used</span>
                  <span className="text-yellow-100">{formatBytes(stats.storage.used * 1024 * 1024 * 1024)}</span>
                </div>
                <Progress value={stats.storage.percentage} className="h-2" />
              </div>
              <div className="text-sm text-yellow-400/80">
                Total: {formatBytes(stats.storage.total * 1024 * 1024 * 1024)}
              </div>
            </div>
          </Card>

          {/* Network Stats */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Network</h3>
              <div className="text-sm text-green-400">
                {stats.network.effectiveType.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-400/80">Download:</span>
                <span className="text-yellow-100">{stats.network.downlink} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400/80">Upload:</span>
                <span className="text-yellow-100">{stats.network.uplink} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400/80">Latency:</span>
                <span className="text-yellow-100">{stats.network.rtt} ms</span>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">System</h3>
              <div className="text-sm text-green-400">ONLINE</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-400/80">Uptime:</span>
                <span className="text-yellow-100">{formatUptime(Math.floor(Date.now() / 1000) - stats.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400/80">Last Update:</span>
                <span className="text-yellow-100">
                  {new Date(stats.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Processes */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect lg:col-span-2 xl:col-span-3">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Running Processes</h3>
            <div className="space-y-3">
              {stats.processes.map((process, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded border border-yellow-400/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation" />
                    <span className="text-yellow-100 font-medium">{process.name}</span>
                    <span className="text-xs text-green-400 px-2 py-1 bg-green-400/20 rounded">
                      {process.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-yellow-400/80">CPU: </span>
                      <span className="text-yellow-100">{process.cpu}%</span>
                    </div>
                    <div>
                      <span className="text-yellow-400/80">Memory: </span>
                      <span className="text-yellow-100">{formatBytes(process.memory * 1024 * 1024)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}