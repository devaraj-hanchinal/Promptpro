import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Validate Setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Server Error: Missing GEMINI_API_KEY");
      return NextResponse.json(
        { error: "Configuration Error: GEMINI_API_KEY is missing in Vercel." }, 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. Parse Request
    const body = await req.json();
    const { prompt, style, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 });
    }

    // 3. Configure Model (Using Flash for better stability)
    // We use gemini-1.5-flash as it is the current standard for free tier speed
    const aiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemInstruction = `
      You are an expert Prompt Engineer. Optimize the following prompt to be clear, 
      effective, and ${style || "detailed"}. The target AI model is ${model || "general"}.
      Return ONLY the optimized prompt text. No explanations.
    `;

    // 4. Generate Content with explicit error handling
    try {
      const result = await aiModel.generateContent(`${systemInstruction}\n\nUser Prompt: "${prompt}"`);
      const response = await result.response;
      const optimizedPrompt = response.text();

      return NextResponse.json({ optimizedPrompt });

    } catch (aiError: any) {
      console.error("Gemini AI API Error:", aiError);
      
      // Return the ACTUAL error message to the frontend for debugging
      const errorMessage = aiError?.message || "Unknown AI Error";
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
         return NextResponse.json(
           { error: "Rate Limit Exceeded. Please wait 1-2 minutes." }, 
           { status: 429 }
         );
      }
      
      // Pass the real error string so we can see it
      return NextResponse.json(
        { error: `Google API Error: ${errorMessage}` }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Critical Server Error:", error);
    return NextResponse.json(
      { error: `Server Error: ${error.message}` }, 
      { status: 500 }
    );
  }
}
