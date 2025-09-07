"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechManager, processVoiceCommand } from '@/lib/speech';

export interface VoiceCommandState {
  isListening: boolean;
  isProcessing: boolean;
  lastCommand: string | null;
  error: string | null;
  isSupported: boolean;
}

export interface VoiceCommandHandlers {
  onCommand: (action: string, parameters?: any) => void;
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
}

export function useVoiceCommands(handlers: VoiceCommandHandlers) {
  const [state, setState] = useState<VoiceCommandState>({
    isListening: false,
    isProcessing: false,
    lastCommand: null,
    error: null,
    isSupported: false
  });

  const speechManagerRef = useRef<SpeechManager | null>(null);
  const isInitialized = useRef(false);

  const initializeSpeechManager = useCallback(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      speechManagerRef.current = new SpeechManager();
      setState(prev => ({
        ...prev,
        isSupported: speechManagerRef.current?.isSpeechRecognitionSupported() || false
      }));
      isInitialized.current = true;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!speechManagerRef.current || state.isListening) return;

    setState(prev => ({ ...prev, isListening: true, error: null }));

    try {
      const transcript = await speechManagerRef.current.startListening();
      
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        lastCommand: transcript,
        isProcessing: true 
      }));

      // Process the voice command
      const command = processVoiceCommand(transcript);
      
      if (command) {
        handlers.onCommand(command.action, command.parameters);
      } else {
        // If no specific command, treat as general transcript
        handlers.onTranscript(transcript);
      }

      setState(prev => ({ ...prev, isProcessing: false }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Voice recognition failed';
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        isProcessing: false,
        error: errorMessage 
      }));
      handlers.onError(errorMessage);
    }
  }, [state.isListening, handlers]);

  const stopListening = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.stopListening();
      setState(prev => ({ ...prev, isListening: false, isProcessing: false }));
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!speechManagerRef.current) return;

    try {
      await speechManagerRef.current.speak(text);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.stopSpeaking();
    }
  }, []);

  // Auto-initialize when component mounts
  useEffect(() => {
    initializeSpeechManager();
  }, [initializeSpeechManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechManagerRef.current) {
        speechManagerRef.current.stopListening();
        speechManagerRef.current.stopSpeaking();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    initialize: initializeSpeechManager
  };
}

// Continuous listening hook for always-on voice commands
export function useContinuousVoiceCommands(handlers: VoiceCommandHandlers, enabled: boolean = false) {
  const voiceCommands = useVoiceCommands(handlers);
  const continuousTimeoutRef = useRef<number | null>(null);

  const startContinuousListening = useCallback(() => {
    if (!enabled || !voiceCommands.isSupported) return;

    const listen = async () => {
      if (!voiceCommands.isListening && !voiceCommands.isProcessing) {
        try {
          await voiceCommands.startListening();
        } catch (error) {
          console.warn('Continuous listening error:', error);
        }
      }
      
      // Schedule next listening cycle
      continuousTimeoutRef.current = window.setTimeout(listen, 1000);
    };

    listen();
  }, [enabled, voiceCommands.isSupported, voiceCommands.isListening, voiceCommands.isProcessing, voiceCommands.startListening]);

  const stopContinuousListening = useCallback(() => {
    if (continuousTimeoutRef.current) {
      clearTimeout(continuousTimeoutRef.current);
      continuousTimeoutRef.current = null;
    }
    voiceCommands.stopListening();
  }, [voiceCommands.stopListening]);

  useEffect(() => {
    if (enabled) {
      startContinuousListening();
    } else {
      stopContinuousListening();
    }

    return stopContinuousListening;
  }, [enabled, startContinuousListening, stopContinuousListening]);

  return {
    ...voiceCommands,
    startContinuousListening,
    stopContinuousListening,
    isContinuousMode: enabled
  };
}