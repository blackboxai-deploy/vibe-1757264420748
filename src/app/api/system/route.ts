import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulated system stats for browser environment
    const systemStats = {
      memory: {
        used: Math.round(Math.random() * 4000 + 2000), // 2-6 GB
        total: 8192, // 8 GB
        percentage: Math.round(Math.random() * 40 + 30) // 30-70%
      },
      cpu: {
        usage: Math.round(Math.random() * 60 + 20), // 20-80%
        cores: navigator.hardwareConcurrency || 4,
        temperature: Math.round(Math.random() * 30 + 45) // 45-75°C
      },
      storage: {
        used: Math.round(Math.random() * 500 + 200), // 200-700 GB
        total: 1000, // 1 TB
        percentage: Math.round(Math.random() * 50 + 20) // 20-70%
      },
      network: {
        downlink: Math.round(Math.random() * 100 + 50), // 50-150 Mbps
        uplink: Math.round(Math.random() * 50 + 20), // 20-70 Mbps
        rtt: Math.round(Math.random() * 50 + 10), // 10-60ms
        effectiveType: '4g'
      },
      processes: [
        {
          name: 'JARVIS Interface',
          cpu: Math.round(Math.random() * 15 + 5),
          memory: Math.round(Math.random() * 300 + 100),
          status: 'Running'
        },
        {
          name: 'Chrome Browser',
          cpu: Math.round(Math.random() * 25 + 10),
          memory: Math.round(Math.random() * 800 + 200),
          status: 'Running'
        },
        {
          name: 'System Monitor',
          cpu: Math.round(Math.random() * 5 + 1),
          memory: Math.round(Math.random() * 50 + 20),
          status: 'Running'
        },
        {
          name: 'AI Processing',
          cpu: Math.round(Math.random() * 40 + 20),
          memory: Math.round(Math.random() * 500 + 200),
          status: 'Running'
        },
        {
          name: 'Background Services',
          cpu: Math.round(Math.random() * 10 + 2),
          memory: Math.round(Math.random() * 150 + 50),
          status: 'Running'
        }
      ],
      uptime: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7), // Up to 7 days
      timestamp: new Date().toISOString()
    };

    // Add health recommendations
    const recommendations = [];
    
    if (systemStats.memory.percentage > 80) {
      recommendations.push('High memory usage detected. Consider closing unused applications.');
    }
    
    if (systemStats.cpu.usage > 70) {
      recommendations.push('High CPU usage detected. Check for resource-intensive processes.');
    }
    
    if (systemStats.storage.percentage > 85) {
      recommendations.push('Low disk space. Consider cleaning up temporary files.');
    }
    
    if (systemStats.cpu.temperature > 70) {
      recommendations.push('CPU temperature is elevated. Check system cooling.');
    }

    return NextResponse.json({
      success: true,
      data: systemStats,
      recommendations,
      status: 'operational'
    });

  } catch (error) {
    console.error('System API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve system information',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, target } = await request.json();
    
    let response = {};
    
    switch (action) {
      case 'kill_process':
        response = {
          message: `Process termination requested for: ${target}`,
          success: true,
          note: 'This would terminate the specified process in a real system environment'
        };
        break;
        
      case 'restart_service':
        response = {
          message: `Service restart requested for: ${target}`,
          success: true,
          note: 'This would restart the specified service in a real system environment'
        };
        break;
        
      case 'clear_cache':
        response = {
          message: 'System cache cleanup initiated',
          success: true,
          note: 'This would clear system caches in a real system environment'
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown system action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System Action Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to execute system action' },
      { status: 500 }
    );
  }
}