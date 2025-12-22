import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' }, 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // CHANGE IS HERE: Using the specific version number "001"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001"});

    const { prompt, style } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const systemInstruction = `You are an expert prompt engineer. 
    Optimize the following prompt to be clearer, more specific, and better structured.
    Apply the "${style || 'detailed'}" style.
    Return ONLY the optimized prompt text, nothing else.`;

    const result = await model.generateContent(systemInstruction + "\n\nOriginal Prompt: " + prompt);
    const response = await result.response;
    const optimizedPrompt = response.text();

    return NextResponse.json({ optimizedPrompt });
  } catch (error: any) {
    console.error('Gemini Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to optimize prompt' },
      { status: 500 }
    );
  }
}
