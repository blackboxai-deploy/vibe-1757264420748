"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  category: 'system' | 'ai' | 'utility' | 'shortcut';
  shortcut?: string;
}

interface QuickActionsProps {
  isVisible: boolean;
  onToggle: () => void;
  onSystemAction?: (action: string) => void;
  onAIAction?: (prompt: string) => void;
}

export default function QuickActions({ 
  isVisible, 
  onToggle, 
  onSystemAction, 
  onAIAction 
}: QuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    {
      id: 'system-stats',
      title: 'System Status',
      description: 'Show system performance and health',
      icon: '📊',
      category: 'system',
      shortcut: 'Ctrl+S',
      action: () => onSystemAction?.('SHOW_SYSTEM_STATS')
    },
    {
      id: 'weather-check',
      title: 'Weather Report',
      description: 'Get current weather and forecast',
      icon: '🌤️',
      category: 'utility',
      shortcut: 'Ctrl+W',
      action: () => onSystemAction?.('SHOW_WEATHER')
    },
    {
      id: 'news-feed',
      title: 'Latest News',
      description: 'Display recent news and headlines',
      icon: '📰',
      category: 'utility',
      shortcut: 'Ctrl+N',
      action: () => onSystemAction?.('SHOW_NEWS')
    },
    {
      id: 'ai-summarize',
      title: 'AI Summary',
      description: 'Summarize system status and activities',
      icon: '🤖',
      category: 'ai',
      action: () => onAIAction?.('Please provide a comprehensive summary of the current system status, recent activities, and any important information I should know about.')
    },
    {
      id: 'ai-optimize',
      title: 'System Optimization',
      description: 'AI-powered system optimization tips',
      icon: '⚡',
      category: 'ai',
      action: () => onAIAction?.('Analyze my current system performance and provide specific recommendations for optimization and improvement.')
    },
    {
      id: 'ai-security',
      title: 'Security Check',
      description: 'AI security assessment and recommendations',
      icon: '🛡️',
      category: 'ai',
      action: () => onAIAction?.('Perform a security assessment of my system and provide recommendations for improving security and protecting against threats.')
    },
    {
      id: 'clear-chat',
      title: 'Clear Chat',
      description: 'Clear the conversation history',
      icon: '🗑️',
      category: 'utility',
      shortcut: 'Ctrl+Del',
      action: () => {
        if ((window as any).jarvisClearChat) {
          (window as any).jarvisClearChat();
        }
      }
    },
    {
      id: 'full-screen',
      title: 'Toggle Fullscreen',
      description: 'Enter or exit fullscreen mode',
      icon: '🖥️',
      category: 'shortcut',
      shortcut: 'F11',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    },
    {
      id: 'voice-toggle',
      title: 'Voice Control',
      description: 'Toggle voice recognition on/off',
      icon: '🎤',
      category: 'system',
      shortcut: 'Ctrl+Space',
      action: () => onSystemAction?.('TOGGLE_VOICE')
    },
    {
      id: 'ai-help',
      title: 'JARVIS Help',
      description: 'Get help with JARVIS commands and features',
      icon: '❓',
      category: 'ai',
      action: () => onAIAction?.('Please explain all the available JARVIS features, commands, and how to use them effectively. Include voice commands, shortcuts, and best practices.')
    },
    {
      id: 'minimize-all',
      title: 'Minimize All',
      description: 'Minimize all open panels',
      icon: '📦',
      category: 'shortcut',
      shortcut: 'Ctrl+M',
      action: () => onSystemAction?.('MINIMIZE_INTERFACE')
    },
    {
      id: 'emergency-mode',
      title: 'Emergency Protocol',
      description: 'Activate emergency system protocols',
      icon: '🚨',
      category: 'system',
      action: () => {
        if (confirm('Activate emergency protocols? This will prioritize system safety and performance.')) {
          onAIAction?.('Emergency protocols activated. Please provide immediate system status, identify any critical issues, and recommend priority actions for system safety and stability.');
        }
      }
    }
  ];

  const categories = ['all', 'system', 'ai', 'utility', 'shortcut'];
  
  const filteredActions = quickActions.filter(action => 
    selectedCategory === 'all' || action.category === selectedCategory
  );

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'system': return 'text-blue-400 bg-blue-400/20';
      case 'ai': return 'text-purple-400 bg-purple-400/20';
      case 'utility': return 'text-green-400 bg-green-400/20';
      case 'shortcut': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const executeAction = (action: QuickAction) => {
    // Add command to history if available
    if ((window as any).jarvisAddCommand) {
      const commandId = (window as any).jarvisAddCommand(
        action.title,
        'system',
        undefined,
        'processing'
      );
      
      try {
        action.action();
        
        // Update command status
        setTimeout(() => {
          if ((window as any).jarvisUpdateCommand) {
            (window as any).jarvisUpdateCommand(
              commandId,
              `${action.title} executed successfully`,
              'success'
            );
          }
        }, 500);
      } catch (error) {
        if ((window as any).jarvisUpdateCommand) {
          (window as any).jarvisUpdateCommand(
            commandId,
            `${action.title} failed: ${error}`,
            'error'
          );
        }
      }
    } else {
      action.action();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-orange-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">QUICK ACTIONS</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-yellow-400/80">
            {quickActions.length} actions available
          </div>
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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            className={`${
              selectedCategory === category
                ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
                : 'border-yellow-400/50 text-yellow-400/80 hover:bg-yellow-400/10'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
            <span className="ml-2">
              ({quickActions.filter(a => category === 'all' || a.category === category).length})
            </span>
          </Button>
        ))}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredActions.map((action) => (
          <Card
            key={action.id}
            className="bg-black/40 border-yellow-400/30 p-4 hover:border-yellow-400/60 transition-all duration-300 cursor-pointer hover:scale-105 hologram-effect"
            onClick={() => executeAction(action)}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{action.icon}</div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${getCategoryColor(action.category)}`}>
                  {action.category.toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-yellow-100 font-semibold mb-2 leading-tight">
                  {action.title}
                </h3>
                <p className="text-yellow-400/80 text-sm leading-relaxed mb-3">
                  {action.description}
                </p>
              </div>
              
              {action.shortcut && (
                <div className="mt-auto pt-2 border-t border-yellow-400/20">
                  <div className="text-xs text-yellow-400/60 font-mono">
                    {action.shortcut}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Keyboard Shortcuts Info */}
      <Card className="bg-black/40 border-yellow-400/30 p-4 hologram-effect">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {quickActions.filter(a => a.shortcut).map((action) => (
            <div key={action.id} className="flex items-center justify-between">
              <span className="text-yellow-400/80">{action.title}:</span>
              <kbd className="px-2 py-1 bg-black/50 border border-yellow-400/30 rounded text-yellow-100 font-mono text-xs">
                {action.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}