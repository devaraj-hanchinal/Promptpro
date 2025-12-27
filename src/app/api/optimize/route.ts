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
    
    // logic to define length instructions based on user selection
    const isDetailed = style.toLowerCase().includes("detailed");
    
    const lengthInstruction = isDetailed 
      ? "Make the prompt comprehensive and structured. You CAN use bullet points, specific constraints, and persona details. It should be rich in detail but STRICTLY an instruction, not the final output."
      : "Keep the prompt concise, direct, and under 3 sentences.";

    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are PromptPro, a specialized AI Prompt Engineer.
      
      YOUR GOAL:
      Rewrite the user's raw input into a clear, effective, and professional prompt.

      CRITICAL RULES:
      1. **DO NOT EXECUTE THE PROMPT.** (e.g., If asked to "write a mail", do NOT write the mail. Write the *instructions* for an AI to write the mail).
      2. **DIRECT OUTPUT ONLY.** Do not say "Here is the optimized prompt." Just output the prompt text.
      
      STYLE GUIDELINES:
      - Selected Style: ${style}
      - Target Model: ${model}
      - Length Rule: ${lengthInstruction}
      
      If "Detailed", specific structure (Context -> Task -> Constraints -> Format) is encouraged.`
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
