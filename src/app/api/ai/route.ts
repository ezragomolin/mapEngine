import { NextRequest, NextResponse } from 'next/server';
import {
  getChatCompletion,
  getInitialAnalysis,
  AiChatRequest,
} from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: AiChatRequest = await request.json();
    const { message, history, context } = body;

    if (!context) {
      return NextResponse.json(
        { error: 'Missing screen context' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    if (message === '__initial_analysis__') {
      const reply = await getInitialAnalysis(context);
      return NextResponse.json({ reply });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid message' },
        { status: 400 }
      );
    }

    const reply = await getChatCompletion(message, history || [], context);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error.message);
    return NextResponse.json(
      { error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
