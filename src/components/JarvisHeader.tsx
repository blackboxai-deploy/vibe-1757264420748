"use client";

import { useState, useEffect } from 'react';

interface JarvisHeaderProps {
  onToggleVoice: () => void;
  isVoiceActive: boolean;
  systemStatus: 'online' | 'processing' | 'error';
}

export default function JarvisHeader({ onToggleVoice, isVoiceActive, systemStatus }: JarvisHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuTemp, setCpuTemp] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('Connected');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCpuTemp(Math.round(Math.random() * 20 + 45)); // 45-65°C
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate network status updates
    const networkTimer = setInterval(() => {
      const statuses = ['Connected', 'High Speed', 'Optimal'];
      setNetworkStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 30000);

    return () => clearInterval(networkTimer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="w-full bg-black/90 border-b border-yellow-400/30 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* JARVIS Logo and Status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full pulse-animation" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus)} pulse-animation`} />
                </div>
              </div>
              <div>
                <h1 className="jarvis-font text-2xl font-bold text-yellow-400 glow-text">
                  J.A.R.V.I.S
                </h1>
                <p className={`text-sm ${getStatusColor(systemStatus)} font-semibold`}>
                  {systemStatus.toUpperCase()} • Just A Rather Very Intelligent System
                </p>
              </div>
            </div>

            {/* System Indicators */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation" />
                <span className="text-green-400">CPU: {cpuTemp}°C</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full pulse-animation" />
                <span className="text-blue-400">{networkStatus}</span>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="text-right">
            <div className="text-lg font-mono text-yellow-400 glow-text">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-yellow-400/80">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Voice Control Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleVoice}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                isVoiceActive
                  ? 'bg-red-500/20 text-red-400 border border-red-400 glow-border'
                  : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400 hover:bg-yellow-400/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isVoiceActive ? 'bg-red-400' : 'bg-yellow-400'} ${isVoiceActive ? 'pulse-animation' : ''}`} />
                <span>{isVoiceActive ? 'LISTENING' : 'VOICE INACTIVE'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w-full h-1 bg-black">
        <div className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 opacity-60">
          <div className="h-full scanning-line bg-yellow-400/40" />
        </div>
      </div>
    </header>
  );
}