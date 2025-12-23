import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Check if Key exists
    if (!apiKey) {
      return NextResponse.json({ optimizedPrompt: "Error: No API Key found in Vercel." });
    }

    // 2. Direct Call to Google to list available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    // 3. Handle Google Error
    if (data.error) {
      return NextResponse.json({ 
        optimizedPrompt: `GOOGLE ERROR: ${data.error.message} (Code: ${data.error.code})` 
      });
    }

    // 4. Success! List the models
    const modelNames = data.models
      ? data.models.map((m: any) => m.name.replace('models/', '')).join(', ')
      : "No models found.";

    return NextResponse.json({ 
      optimizedPrompt: `SUCCESS! Your API Key works. Available Models: \n\n${modelNames}` 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      optimizedPrompt: `SYSTEM ERROR: ${error.message}` 
    });
  }
}
