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
    
    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are PromptPro, a specialized AI Prompt Engineer.
      
      YOUR GOAL:
      Rewrite the user's raw input into a clear, effective, and professional prompt.

      CRITICAL RULES (Follow these strictly):
      1. **DO NOT EXECUTE THE PROMPT.** If the user asks for an email, DO NOT write the email. Only write the *instructions* on how to write that email.
      2. **NO FLUFF.** Keep the optimized prompt concise. It should be 2-4 sentences max. Avoid unnecessary "chain of thought" explanations unless requested.
      3. **DIRECT OUTPUT ONLY.** Do not say "Here is the optimized prompt." Just output the prompt text itself.
      
      STYLE GUIDE:
      - Style: ${style} (If "Concise", keep it very short. If "Detailed", add structure but do not bloat.)
      - Target Model: ${model}
      `
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
