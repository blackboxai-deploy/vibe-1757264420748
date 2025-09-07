"use client";

import { useState, useEffect, useRef } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { Button } from '@/components/ui/button';

interface VoiceInterfaceProps {
  onCommand: (action: string, parameters?: any) => void;
  onTranscript: (text: string) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export default function VoiceInterface({ 
  onCommand, 
  onTranscript, 
  isActive, 
  onActiveChange 
}: VoiceInterfaceProps) {

  const [isResponsePlaying, setIsResponsePlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const mediaStreamRef = useRef<MediaStream>();

  const voiceCommands = useVoiceCommands({
    onCommand: (action, parameters) => {
      console.log('Voice command:', action, parameters);
      onCommand(action, parameters);
      
      // Provide audio feedback for recognized commands
      if (action !== 'CHAT') {
        speak(`Command recognized: ${action.replace('_', ' ').toLowerCase()}`);
      }
    },
    onTranscript: (transcript) => {
      console.log('Voice transcript:', transcript);
      onTranscript(transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      speak('Voice recognition error. Please try again.');
    }
  });

  // Initialize audio visualization
  useEffect(() => {
    const initializeAudio = async () => {
      if (isActive && voiceCommands.isSupported) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;
          
          startVisualization();
        } catch (error) {
          console.error('Audio initialization error:', error);
        }
      } else {
        stopVisualization();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = undefined;
        }
      }
    };

    initializeAudio();

    return () => {
      stopVisualization();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, voiceCommands.isSupported]);

  const startVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        const red = barHeight + 25 * (i / bufferLength);
        const green = 250 * (i / bufferLength);
        const blue = 50;
        
        ctx.fillStyle = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${blue})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const toggleVoiceListening = async () => {
    if (voiceCommands.isListening) {
      voiceCommands.stopListening();
    } else {
      try {
        await voiceCommands.startListening();
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const speak = async (text: string) => {
    setIsResponsePlaying(true);
    try {
      await voiceCommands.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsResponsePlaying(false);
    }
  };

  const testVoice = () => {
    speak('Voice interface is working correctly, sir. All systems are operational.');
  };

  // Voice status indicator
  const getVoiceStatus = () => {
    if (!voiceCommands.isSupported) return { text: 'NOT SUPPORTED', color: 'text-red-400' };
    if (voiceCommands.isListening) return { text: 'LISTENING', color: 'text-green-400' };
    if (voiceCommands.isProcessing) return { text: 'PROCESSING', color: 'text-yellow-400' };
    if (isResponsePlaying) return { text: 'SPEAKING', color: 'text-blue-400' };
    if (isActive) return { text: 'READY', color: 'text-yellow-400' };
    return { text: 'INACTIVE', color: 'text-gray-400' };
  };

  const status = getVoiceStatus();

  return (
    <div className="bg-black/40 border border-yellow-400/30 rounded-lg p-6 hologram-effect">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${status.color.replace('text-', 'bg-')} pulse-animation`} />
          <h2 className="text-xl font-semibold text-yellow-400 jarvis-font">VOICE INTERFACE</h2>
        </div>
        <div className={`text-sm font-mono ${status.color}`}>
          {status.text}
        </div>
      </div>

      {/* Voice Visualizer */}
      <div className="mb-6">
        <div className="bg-black/60 rounded-lg p-4 border border-yellow-400/20">
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="w-full h-24 rounded"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(255,215,0,0.1) 50%, rgba(0,0,0,0.8) 100%)' }}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
              <span className="text-yellow-400/60">Voice interface inactive</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Button
          onClick={() => onActiveChange(!isActive)}
          disabled={!voiceCommands.isSupported}
          className={`${
            isActive
              ? 'bg-red-500/20 text-red-400 border-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 border-green-400 hover:bg-green-500/30'
          } border transition-all duration-300`}
        >
          {isActive ? 'Disable Voice' : 'Enable Voice'}
        </Button>

        <Button
          onClick={toggleVoiceListening}
          disabled={!isActive || !voiceCommands.isSupported || voiceCommands.isProcessing}
          className="bg-yellow-400/20 text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/30 border"
        >
          {voiceCommands.isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>

        <Button
          onClick={testVoice}
          disabled={!voiceCommands.isSupported}
          className="bg-blue-500/20 text-blue-400 border-blue-400/50 hover:bg-blue-500/30 border"
        >
          Test Voice
        </Button>
      </div>

      {/* Status Information */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-yellow-400/80">Speech Recognition:</span>
          <span className={voiceCommands.isSupported ? 'text-green-400' : 'text-red-400'}>
            {voiceCommands.isSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>
        
        {voiceCommands.lastCommand && (
          <div className="flex justify-between">
            <span className="text-yellow-400/80">Last Command:</span>
            <span className="text-blue-400 font-mono">"{voiceCommands.lastCommand}"</span>
          </div>
        )}
        
        {voiceCommands.error && (
          <div className="bg-red-500/10 border border-red-400/30 p-3 rounded">
            <div className="text-red-400 text-xs">
              Error: {voiceCommands.error}
            </div>
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded">
        <h3 className="text-yellow-400 font-semibold mb-2">Available Commands:</h3>
        <div className="text-xs text-yellow-400/80 space-y-1">
          <p>• "Hey JARVIS..." or "JARVIS..." - Wake commands</p>
          <p>• "Show system stats" - Display system information</p>
          <p>• "Show weather" - Display weather information</p>
          <p>• "Show news" - Display latest news</p>
          <p>• "Clear chat" - Clear conversation history</p>
          <p>• Or just speak naturally to chat with JARVIS</p>
        </div>
      </div>
    </div>
  );
}