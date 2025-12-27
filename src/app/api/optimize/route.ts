import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, style, model } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- MODEL SELECTION ---
    // Use "gemini-2.5-flash" for the best balance (Reasoning + Speed)
    // Use "gemini-2.5-flash-lite-preview" if you want extreme speed
    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are PromptPro, an expert AI Prompt Engineer. 
      Your goal is to rewrite the user's raw prompt into a highly optimized, professional prompt.
      
      Follow these rules:
      1. Use the "${style}" output style.
      2. If the user selected "${model}", optimize specifically for that model's capabilities.
      3. Do not include conversational filler (like "Here is your prompt"). Just output the optimized prompt.
      4. Use advanced techniques like Chain-of-Thought or Delimiters where appropriate.`
    });

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const optimizedText = response.text();

    return NextResponse.json({ optimizedPrompt: optimizedText });

  } catch (error: any) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { error: "Failed to optimize prompt." }, 
      { status: 500 }
    );
  }
}
