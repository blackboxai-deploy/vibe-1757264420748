import { NextRequest, NextResponse } from 'next/server';
import { AIClient } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { message, messages, systemPrompt } = await request.json();
    
    if (!message && !messages) {
      return NextResponse.json(
        { error: 'Message or messages array is required' },
        { status: 400 }
      );
    }

    const aiClient = AIClient.getInstance();
    
    // Prepare messages array
    let chatMessages;
    
    if (messages) {
      // Use provided messages array
      chatMessages = messages;
    } else {
      // Create messages from single message
      chatMessages = [
        {
          role: 'system',
          content: systemPrompt || aiClient.getSystemPrompt()
        },
        {
          role: 'user',
          content: message
        }
      ];
    }

    // Get AI response
    const response = await aiClient.sendMessage(chatMessages);

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'JARVIS Chat API is online',
    status: 'operational',
    features: [
      'AI-powered responses using Claude Sonnet-4',
      'Context-aware conversations',
      'System integration commands',
      'Voice command processing'
    ],
    timestamp: new Date().toISOString()
  });
}