import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt, style, model } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use a lightweight model for speed and higher limits
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
      
      // Check for Rate Limit (429) or Quota Exceeded
      if (aiError.message?.includes("429") || aiError.message?.includes("Quota") || aiError.message?.includes("Too Many Requests")) {
         return NextResponse.json(
           { error: "Server busy (Rate Limit). Please wait 1 minute and try again." }, 
           { status: 429 }
         );
      }
      
      throw aiError; // Rethrow other errors
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Failed to optimize prompt. Please try again." }, 
      { status: 500 }
    );
  }
}
