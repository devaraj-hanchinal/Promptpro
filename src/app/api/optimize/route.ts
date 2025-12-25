import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuration Error: GEMINI_API_KEY is missing." }, 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { prompt, style } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // NOW SAFE TO USE: gemini-1.5-flash
    // (Because you successfully updated the SDK!)
    const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `
      You are an expert Prompt Engineer. Optimize the following prompt to be clear, 
      effective, and ${style || "detailed"}. 
      Return ONLY the optimized prompt text. No explanations.
    `;

    try {
      const result = await aiModel.generateContent(`${systemInstruction}\n\nUser Prompt: "${prompt}"`);
      const response = await result.response;
      const optimizedPrompt = response.text();

      return NextResponse.json({ optimizedPrompt });

    } catch (aiError: any) {
      console.error("Gemini AI API Error:", aiError);
      const errorMessage = aiError?.message || "Unknown error";

      if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
         return NextResponse.json(
           { error: "Daily Limit Reached. Please try again tomorrow." }, 
           { status: 429 }
         );
      }
      
      return NextResponse.json(
        { error: `Google API Error: ${errorMessage}` }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: `Server Error: ${error.message}` }, 
      { status: 500 }
    );
  }
}