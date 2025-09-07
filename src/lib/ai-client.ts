// AI Client Configuration for JARVIS
export const AI_CONFIG = {
  endpoint: 'https://oi-server.onrender.com/chat/completions',
  headers: {
    'CustomerId': 'blackhorse0.edu@gmail.com',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  models: {
    chat: 'openrouter/claude-sonnet-4',
    imageGeneration: 'replicate/black-forest-labs/flux-1.1-pro',
    videoGeneration: 'replicate/google/veo-3'
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIClient {
  private static instance: AIClient;
  
  public static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(AI_CONFIG.endpoint, {
        method: 'POST',
        headers: AI_CONFIG.headers,
        body: JSON.stringify({
          model: AI_CONFIG.models.chat,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Client Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await fetch(AI_CONFIG.endpoint, {
        method: 'POST',
        headers: AI_CONFIG.headers,
        body: JSON.stringify({
          model: AI_CONFIG.models.imageGeneration,
          messages: [
            {
              role: 'user',
              content: `Generate an image: ${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate image');
    }
  }

  getSystemPrompt(): string {
    return `You are JARVIS, an advanced AI assistant for PC users. You are intelligent, helpful, and have a sophisticated personality similar to the AI from Iron Man. 

Core Capabilities:
- Provide intelligent responses to user queries
- Help with PC tasks, troubleshooting, and system optimization
- Assist with productivity, scheduling, and task management
- Offer technical guidance and explanations
- Monitor system performance and provide insights
- Help with file management and organization

Personality:
- Professional yet personable
- Confident and knowledgeable
- Slightly witty and engaging
- Always helpful and solution-oriented
- Use sophisticated language but remain accessible

Response Guidelines:
- Keep responses concise but informative
- Provide actionable advice when possible
- If you cannot perform a specific system action, explain what the user should do
- Always maintain the JARVIS persona
- Use technical terminology appropriately but explain complex concepts

Remember: You are running on the user's PC as their personal AI assistant. Be helpful, intelligent, and maintain the sophisticated JARVIS personality.`;
  }
}