import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Get data from your frontend
    const { prompt, style, model } = await req.json();
    
    // 2. secure check for API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using "gemini-2.5-flash" as seen in your screenshot. 
    // If that specific string fails (since it's a preview), fallback to "gemini-1.5-flash".
    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are PromptPro, an expert AI Prompt Engineer. 
      Your goal is to rewrite the user's raw prompt into a highly optimized, professional prompt.
      
      Follow these rules:
      1. Use the "${style}" output style.
      2. If the user selected "${model}", optimize specifically for that model's quirks.
      3. Do not include conversational filler (like "Here is your prompt"). Just output the optimized prompt.
      4. Use advanced techniques like Chain-of-Thought or Delimiters where appropriate.`
    });

    // 4. Generate the Content
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const optimizedText = response.text();

    // 5. Return to Frontend
    return NextResponse.json({ optimizedPrompt: optimizedText });

  } catch (error: any) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { error: "Failed to optimize prompt. Please try again." }, 
      { status: 500 }
    );
  }
}
