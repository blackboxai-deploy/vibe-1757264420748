// System Monitoring Utilities for JARVIS

export interface SystemStats {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    downlink: number;
    rtt: number;
    effectiveType: string;
  };
  performance: {
    timing: PerformanceTiming;
    navigation: number;
  };
  battery?: {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  };
}

export interface ProcessInfo {
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  status: string;
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private updateInterval: number | null = null;
  private callbacks: Array<(stats: SystemStats) => void> = [];

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  async getSystemStats(): Promise<SystemStats> {
    const stats: SystemStats = {
      memory: await this.getMemoryInfo(),
      cpu: await this.getCPUInfo(),
      storage: await this.getStorageInfo(),
      network: this.getNetworkInfo(),
      performance: this.getPerformanceInfo()
    };

    // Add battery info if available
    const batteryInfo = await this.getBatteryInfo();
    if (batteryInfo) {
      stats.battery = batteryInfo;
    }

    return stats;
  }

  private async getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      
      return {
        used: used / (1024 * 1024), // Convert to MB
        total: total / (1024 * 1024),
        percentage: (used / total) * 100
      };
    }
    
    // Fallback estimation based on available APIs
    return {
      used: 0,
      total: 8192, // Assume 8GB default
      percentage: 0
    };
  }

  private async getCPUInfo() {
    const cores = navigator.hardwareConcurrency || 4;
    
    // Estimate CPU usage based on performance timing
    let usage = 0;
    if ('performance' in window) {
      const start = performance.now();
      // Perform a small computation
      for (let i = 0; i < 100000; i++) {
        Math.random();
      }
      const end = performance.now();
      const computationTime = end - start;
      
      // Rough estimation (not accurate but provides relative measurement)
      usage = Math.min(computationTime * 2, 100);
    }
    
    return {
      usage: Math.round(usage),
      cores
    };
  }

  private async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        
        return {
          used: usage / (1024 * 1024 * 1024), // Convert to GB
          total: quota / (1024 * 1024 * 1024),
          percentage: quota > 0 ? (usage / quota) * 100 : 0
        };
      } catch (error) {
        console.warn('Storage API not available:', error);
      }
    }
    
    // Fallback
    return {
      used: 0,
      total: 1000, // Assume 1TB default
      percentage: 0
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        effectiveType: connection.effectiveType || 'unknown'
      };
    }
    
    return {
      downlink: 0,
      rtt: 0,
      effectiveType: 'unknown'
    };
  }

  private getPerformanceInfo() {
    return {
      timing: performance.timing,
      navigation: performance.navigation.type
    };
  }

  private async getBatteryInfo() {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
    return null;
  }

  startMonitoring(intervalMs: number = 5000, callback: (stats: SystemStats) => void) {
    this.callbacks.push(callback);
    
    if (!this.updateInterval) {
      this.updateInterval = setInterval(async () => {
        const stats = await this.getSystemStats();
        this.callbacks.forEach(cb => cb(stats));
      }, intervalMs);
    }
  }

  stopMonitoring(callback?: (stats: SystemStats) => void) {
    if (callback) {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    } else {
      this.callbacks = [];
    }
    
    if (this.callbacks.length === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Simulate process information (browser-based estimation)
  getProcessInfo(): ProcessInfo[] {
    return [
      {
        name: 'JARVIS Interface',
        cpuUsage: Math.random() * 10 + 5,
        memoryUsage: Math.random() * 200 + 100,
        status: 'Running'
      },
      {
        name: 'Browser Engine',
        cpuUsage: Math.random() * 20 + 10,
        memoryUsage: Math.random() * 500 + 200,
        status: 'Running'
      },
      {
        name: 'System Monitor',
        cpuUsage: Math.random() * 5 + 1,
        memoryUsage: Math.random() * 50 + 20,
        status: 'Running'
      },
      {
        name: 'AI Processing',
        cpuUsage: Math.random() * 30 + 10,
        memoryUsage: Math.random() * 300 + 150,
        status: 'Running'
      }
    ];
  }
}

// Utility functions
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getHealthStatus(percentage: number): 'good' | 'warning' | 'critical' {
  if (percentage < 60) return 'good';
  if (percentage < 85) return 'warning';
  return 'critical';
}

export function getSystemRecommendations(stats: SystemStats): string[] {
  const recommendations: string[] = [];
  
  if (stats.memory.percentage > 85) {
    recommendations.push('Memory usage is high. Consider closing unnecessary applications.');
  }
  
  if (stats.cpu.usage > 80) {
    recommendations.push('CPU usage is high. Check for resource-intensive processes.');
  }
  
  if (stats.storage.percentage > 90) {
    recommendations.push('Storage is nearly full. Consider cleaning up disk space.');
  }
  
  if (stats.network.effectiveType === 'slow-2g' || stats.network.rtt > 1000) {
    recommendations.push('Network connection appears slow. Check your internet connection.');
  }
  
  if (stats.battery && stats.battery.level < 20 && !stats.battery.charging) {
    recommendations.push('Battery level is low. Consider connecting to power.');
  }
  
  return recommendations;
}