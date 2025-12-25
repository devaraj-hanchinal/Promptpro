import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt, style, model } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key is missing in Vercel Settings" }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use 'gemini-pro' model
    const aiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemInstruction = `
      You are an expert Prompt Engineer. Optimize the following prompt to be clear, 
      effective, and ${style}. The target AI model is ${model}.
      Return ONLY the optimized prompt text. No explanations.
    `;

    try {
      const result = await aiModel.generateContent(`${systemInstruction}\n\nUser Prompt: "${prompt}"`);
      const response = await result.response;
      const optimizedPrompt = response.text();

      return NextResponse.json({ optimizedPrompt });

    } catch (aiError: any) {
      console.error("Gemini API Error:", aiError);
      
      // CATCH RATE LIMIT ERRORS SPECIFICALLY
      if (
        aiError.message?.includes("429") || 
        aiError.message?.includes("Quota") || 
        aiError.message?.includes("Too Many Requests")
      ) {
         return NextResponse.json(
           { error: "Speed Limit Reached. Please wait 1 minute." }, 
           { status: 429 }
         );
      }
      
      throw aiError; // Throw other errors to the general catch block
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Failed to optimize prompt. Please try again." }, 
      { status: 500 }
    );
  }
}
