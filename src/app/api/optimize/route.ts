import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, model, style } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert prompt engineer. Your task is to optimize the following prompt for the "${model || 'general'}" AI model.
    The goal is to make the prompt clearer, more specific, and better structured to yield the best results.
    Apply the "${style || 'detailed'}" style to the optimized prompt.
    Return ONLY the optimized prompt text, nothing else.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const optimizedPrompt = completion.choices[0].message.content;

    return NextResponse.json({ optimizedPrompt });
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to optimize prompt' },
      { status: 500 }
    );
  }
}
