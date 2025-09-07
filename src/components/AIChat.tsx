"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onNewMessage?: (message: string) => void;
}

export default function AIChat({ onNewMessage }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Good day, sir. JARVIS is now online and ready to assist you. How may I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onNewMessage?.(content);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from JARVIS');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat cleared. How may I assist you, sir?',
      timestamp: new Date()
    }]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Expose sendMessage for external use (voice commands)
  useEffect(() => {
    (window as any).jarvisSendMessage = sendMessage;
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-black/40 border border-yellow-400/30 rounded-lg hologram-effect">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-yellow-400/30">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full pulse-animation" />
          <h2 className="text-xl font-semibold text-yellow-400 jarvis-font">AI ASSISTANT</h2>
        </div>
        <Button
          onClick={clearChat}
          variant="outline"
          size="sm"
          className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
        >
          Clear Chat
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-100'
                    : 'bg-blue-500/10 border border-blue-400/30 text-blue-100'
                } slide-in`}
              >
                <div className="flex items-start space-x-3">
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      J
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      U
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg slide-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    J
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-yellow-400/30">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask JARVIS anything..."
            disabled={isLoading}
            className="flex-1 bg-black/50 border-yellow-400/50 text-yellow-100 placeholder:text-yellow-400/60 focus:border-yellow-400"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 hover:bg-yellow-400/30 px-6"
          >
            Send
          </Button>
        </div>
        <div className="mt-2 text-xs text-yellow-400/60">
          Press Enter to send • Voice commands available
        </div>
      </div>
    </div>
  );
}