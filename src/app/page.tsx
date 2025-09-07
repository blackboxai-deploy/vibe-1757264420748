"use client";

import { useState, useEffect } from 'react';
import JarvisHeader from '@/components/JarvisHeader';
import AIChat from '@/components/AIChat';
import VoiceInterface from '@/components/VoiceInterface';
import SystemMonitor from '@/components/SystemMonitor';
import WeatherWidget from '@/components/WeatherWidget';
import NewsWidget from '@/components/NewsWidget';
import TaskManager from '@/components/TaskManager';
import CommandHistory from '@/components/CommandHistory';
import QuickActions from '@/components/QuickActions';

export default function JarvisDashboard() {
  const [systemStatus, setSystemStatus] = useState<'online' | 'processing' | 'error'>('online');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Panel visibility states
  const [visiblePanels, setVisiblePanels] = useState({
    aiChat: true,
    voiceInterface: true,
    systemMonitor: false,
    weather: false,
    news: false,
    taskManager: false,
    commandHistory: false,
    quickActions: false
  });

  // Handle voice commands
  const handleVoiceCommand = (action: string, parameters?: any) => {
    setSystemStatus('processing');
    
    switch (action) {
      case 'SHOW_SYSTEM_STATS':
        setVisiblePanels(prev => ({ ...prev, systemMonitor: true }));
        break;
      case 'HIDE_SYSTEM_STATS':
        setVisiblePanels(prev => ({ ...prev, systemMonitor: false }));
        break;
      case 'SHOW_WEATHER':
        setVisiblePanels(prev => ({ ...prev, weather: true }));
        break;
      case 'SHOW_NEWS':
        setVisiblePanels(prev => ({ ...prev, news: true }));
        break;
      case 'OPEN_TASK_MANAGER':
        setVisiblePanels(prev => ({ ...prev, taskManager: true }));
        break;
      case 'CLEAR_CHAT':
        // Clear chat functionality will be handled by the chat component
        break;
      case 'MINIMIZE_INTERFACE':
        setVisiblePanels({
          aiChat: true,
          voiceInterface: false,
          systemMonitor: false,
          weather: false,
          news: false,
          taskManager: false,
          commandHistory: false,
          quickActions: false
        });
        break;
      case 'MAXIMIZE_INTERFACE':
        setVisiblePanels({
          aiChat: true,
          voiceInterface: true,
          systemMonitor: true,
          weather: true,
          news: true,
          taskManager: true,
          commandHistory: true,
          quickActions: true
        });
        break;
      case 'TOGGLE_VOICE':
        setIsVoiceActive(prev => !prev);
        break;
      case 'CHAT':
        if (parameters?.message) {
          handleVoiceTranscript(parameters.message);
        }
        break;
      default:
        console.log('Unknown voice command:', action);
    }
    
    setTimeout(() => setSystemStatus('online'), 1000);
  };

  // Handle voice transcript (send to AI chat)
  const handleVoiceTranscript = (transcript: string) => {
    if ((window as any).jarvisSendMessage) {
      (window as any).jarvisSendMessage(transcript);
    }
  };

  // Handle voice activation toggle
  const toggleVoiceInterface = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  // Handle panel visibility
  const togglePanel = (panel: keyof typeof visiblePanels) => {
    setVisiblePanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  // Handle system actions from quick actions
  const handleSystemAction = (action: string) => {
    handleVoiceCommand(action);
  };

  // Handle AI actions from quick actions
  const handleAIAction = (prompt: string) => {
    handleVoiceTranscript(prompt);
  };

  // Handle new chat messages
  const handleNewMessage = (message: string) => {
    // Add to command history
    if ((window as any).jarvisAddCommand) {
      (window as any).jarvisAddCommand(message, 'text', undefined, 'processing');
    }
  };

  // Initialize JARVIS on mount
  useEffect(() => {
    // Simulate system initialization
    setSystemStatus('processing');
    setTimeout(() => {
      setSystemStatus('online');
      
      // Add welcome message to command history
      if ((window as any).jarvisAddCommand) {
        (window as any).jarvisAddCommand(
          'Initialize JARVIS PC Assistant',
          'system',
          'JARVIS is now online and ready to assist you. All systems operational.',
          'success'
        );
      }
    }, 2000);

    // Setup keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleVoiceCommand('SHOW_SYSTEM_STATS');
            break;
          case 'w':
            event.preventDefault();
            handleVoiceCommand('SHOW_WEATHER');
            break;
          case 'n':
            event.preventDefault();
            handleVoiceCommand('SHOW_NEWS');
            break;
          case 'm':
            event.preventDefault();
            handleVoiceCommand('MINIMIZE_INTERFACE');
            break;
          case 'Delete':
            event.preventDefault();
            handleVoiceCommand('CLEAR_CHAT');
            break;
          case ' ':
            event.preventDefault();
            toggleVoiceInterface();
            break;
        }
      } else if (event.key === 'F11') {
        event.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-yellow-400">
      {/* Header */}
      <JarvisHeader 
        onToggleVoice={toggleVoiceInterface}
        isVoiceActive={isVoiceActive}
        systemStatus={systemStatus}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
          
          {/* Left Column - AI Chat */}
          <div className="xl:col-span-1">
            <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6">
              {visiblePanels.aiChat && (
                <div className="flex-1">
                  <AIChat onNewMessage={handleNewMessage} />
                </div>
              )}
              
              {visiblePanels.voiceInterface && (
                <div className="flex-shrink-0">
                  <VoiceInterface 
                    onCommand={handleVoiceCommand}
                    onTranscript={handleVoiceTranscript}
                    isActive={isVoiceActive}
                    onActiveChange={setIsVoiceActive}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - System Monitoring & Widgets */}
          <div className="xl:col-span-1 space-y-8">
            {visiblePanels.systemMonitor && (
              <SystemMonitor 
                isVisible={visiblePanels.systemMonitor}
                onToggle={() => togglePanel('systemMonitor')}
              />
            )}
            
            {visiblePanels.weather && (
              <WeatherWidget
                isVisible={visiblePanels.weather}
                onToggle={() => togglePanel('weather')}
              />
            )}
            
            {visiblePanels.news && (
              <NewsWidget
                isVisible={visiblePanels.news}
                onToggle={() => togglePanel('news')}
              />
            )}

            {visiblePanels.taskManager && (
              <TaskManager
                isVisible={visiblePanels.taskManager}
                onToggle={() => togglePanel('taskManager')}
              />
            )}
          </div>

          {/* Right Column - Command History & Quick Actions */}
          <div className="xl:col-span-1 space-y-8">
            {visiblePanels.commandHistory && (
              <CommandHistory
                isVisible={visiblePanels.commandHistory}
                onToggle={() => togglePanel('commandHistory')}
                onReplayCommand={handleVoiceTranscript}
              />
            )}
            
            {visiblePanels.quickActions && (
              <QuickActions
                isVisible={visiblePanels.quickActions}
                onToggle={() => togglePanel('quickActions')}
                onSystemAction={handleSystemAction}
                onAIAction={handleAIAction}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation / Quick Panel Access */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col space-y-2">
            {/* Quick Panel Toggle Buttons */}
            <div className="flex flex-wrap gap-2 justify-end">
              {!visiblePanels.systemMonitor && (
                <button
                  onClick={() => togglePanel('systemMonitor')}
                  className="w-12 h-12 bg-black/80 border border-blue-400/50 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-400/20 transition-all duration-300 hover:scale-110"
                  title="System Monitor"
                >
                  📊
                </button>
              )}
              
              {!visiblePanels.weather && (
                <button
                  onClick={() => togglePanel('weather')}
                  className="w-12 h-12 bg-black/80 border border-blue-400/50 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-400/20 transition-all duration-300 hover:scale-110"
                  title="Weather"
                >
                  🌤️
                </button>
              )}
              
              {!visiblePanels.news && (
                <button
                  onClick={() => togglePanel('news')}
                  className="w-12 h-12 bg-black/80 border border-orange-400/50 rounded-full flex items-center justify-center text-orange-400 hover:bg-orange-400/20 transition-all duration-300 hover:scale-110"
                  title="News"
                >
                  📰
                </button>
              )}
              
              {!visiblePanels.taskManager && (
                <button
                  onClick={() => togglePanel('taskManager')}
                  className="w-12 h-12 bg-black/80 border border-purple-400/50 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-400/20 transition-all duration-300 hover:scale-110"
                  title="Tasks"
                >
                  ✓
                </button>
              )}
              
              {!visiblePanels.commandHistory && (
                <button
                  onClick={() => togglePanel('commandHistory')}
                  className="w-12 h-12 bg-black/80 border border-cyan-400/50 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-400/20 transition-all duration-300 hover:scale-110"
                  title="Command History"
                >
                  📋
                </button>
              )}
              
              {!visiblePanels.quickActions && (
                <button
                  onClick={() => togglePanel('quickActions')}
                  className="w-12 h-12 bg-black/80 border border-yellow-400/50 rounded-full flex items-center justify-center text-yellow-400 hover:bg-yellow-400/20 transition-all duration-300 hover:scale-110"
                  title="Quick Actions"
                >
                  ⚡
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '50px 50px',
                 animation: 'grid-move 20s linear infinite'
               }}>
          </div>
        </div>
        
        {/* Scanning Lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 scanning-line" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 scanning-line" />
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}