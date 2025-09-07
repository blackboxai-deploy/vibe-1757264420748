// Speech Recognition and Text-to-Speech for JARVIS

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export class SpeechManager {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.loadVoices();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    }
  }

  private loadVoices() {
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices();
    };
    
    updateVoices();
    this.synthesis.addEventListener('voiceschanged', updateVoices);
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        this.isListening = false;
        resolve(result);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find a suitable voice (prefer deeper, more AI-like voices)
      const preferredVoices = this.voices.filter(voice => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('alex')
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      } else if (this.voices.length > 0) {
        utterance.voice = this.voices[0];
      }

      // Configure voice parameters for JARVIS-like sound
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 0.8;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Voice command patterns
export const VOICE_COMMANDS = {
  WAKE_WORDS: ['jarvis', 'hey jarvis', 'computer'],
  SYSTEM_COMMANDS: {
    'show system stats': 'SHOW_SYSTEM_STATS',
    'hide system stats': 'HIDE_SYSTEM_STATS',
    'open task manager': 'OPEN_TASK_MANAGER',
    'show weather': 'SHOW_WEATHER',
    'show news': 'SHOW_NEWS',
    'clear chat': 'CLEAR_CHAT',
    'minimize interface': 'MINIMIZE_INTERFACE',
    'maximize interface': 'MAXIMIZE_INTERFACE'
  },
  CHAT_COMMANDS: {
    'send message': 'SEND_MESSAGE',
    'stop listening': 'STOP_LISTENING',
    'repeat that': 'REPEAT_LAST',
    'what did you say': 'REPEAT_LAST'
  }
};

export function processVoiceCommand(command: string): { action: string; parameters?: any } | null {
  const lowerCommand = command.toLowerCase().trim();
  
  // Check for wake words
  const hasWakeWord = VOICE_COMMANDS.WAKE_WORDS.some(wake => 
    lowerCommand.includes(wake)
  );
  
  if (!hasWakeWord && !lowerCommand.startsWith('jarvis')) {
    return null; // Not a JARVIS command
  }
  
  // Remove wake words to get the actual command
  let cleanCommand = lowerCommand;
  VOICE_COMMANDS.WAKE_WORDS.forEach(wake => {
    cleanCommand = cleanCommand.replace(wake, '').trim();
  });
  
  // Check system commands
  for (const [pattern, action] of Object.entries(VOICE_COMMANDS.SYSTEM_COMMANDS)) {
    if (cleanCommand.includes(pattern)) {
      return { action };
    }
  }
  
  // Check chat commands
  for (const [pattern, action] of Object.entries(VOICE_COMMANDS.CHAT_COMMANDS)) {
    if (cleanCommand.includes(pattern)) {
      return { action };
    }
  }
  
  // If no specific command found but has wake word, treat as general chat
  if (cleanCommand.length > 0) {
    return { action: 'CHAT', parameters: { message: cleanCommand } };
  }
  
  return null;
}