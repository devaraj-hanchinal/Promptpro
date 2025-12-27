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
    
    // --- 1. DEFINE STYLE RULES (Word Counts & Structure) ---
    let styleInstruction = "";
    
    switch (style) {
      case "Concise & Direct":
        styleInstruction = `
        STYLE: CONCISE
        - Length Limit: Maximum 30-40 words.
        - Structure: Single paragraph. Direct instruction only.
        - Rule: Remove all "fluff" words. No "Please", no "I want". Just the core task.
        `;
        break;
      case "Detailed & Comprehensive":
        styleInstruction = `
        STYLE: DETAILED
        - Length Limit: Minimum 100 words.
        - Structure: Use the "Mega-Prompt" Framework:
          1. **Persona:** (Who the AI should act as)
          2. **Context:** (Background info)
          3. **Task:** (Specific instruction)
          4. **Constraints:** (Format, tone, exclusions)
        - Rule: Expand on the user's idea. If they say "marketing mail", invent the product details to make it a robust example.
        `;
        break;
      case "Creative & Engaging":
        styleInstruction = `
        STYLE: CREATIVE
        - Length Limit: Approx 60-80 words.
        - Structure: Focus on adjectives, tone, and "vibe". Use evocative language.
        `;
        break;
      case "Technical & Precise":
        styleInstruction = `
        STYLE: TECHNICAL
        - Length Limit: Approx 60-80 words.
        - Structure: Focus on code standards, specific libraries, logic constraints, and edge cases.
        `;
        break;
      default:
        styleInstruction = "STYLE: BALANCED (Approx 50 words, clear and professional).";
    }

    // --- 2. DEFINE MODEL SPECIFIC RULES (Added Gemini) ---
    let modelInstruction = "";

    if (model.includes("Midjourney")) {
      modelInstruction = "Target: Midjourney. Focus on visual descriptions (lighting, texture, camera angle). End with parameters like '--ar 16:9 --v 6'.";
    } else if (model.includes("DALL-E")) {
      modelInstruction = "Target: DALL-E 3. Use natural language but be extremely descriptive about composition and subject placement.";
    } else if (model.includes("GPT-4") || model.includes("ChatGPT")) {
      modelInstruction = "Target: GPT-4. Use 'Act as' persona and Chain-of-Thought ('Let's think step by step').";
    } else if (model.toLowerCase().includes("gemini")) {
      // NEW GEMINI LOGIC
      modelInstruction = "Target: Google Gemini. Focus on logical reasoning, clear structure, and asking for multiple drafts if necessary. Gemini loves context.";
    } else {
      modelInstruction = "Target: General AI. Keep it universal and clear.";
    }

    // --- 3. CONFIGURE THE AI ---
    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are PromptPro, the world's best Prompt Engineer.
      
      YOUR GOAL:
      Rewrite the user's raw input into the PERFECT prompt for an AI, following the user's constraints strictly.

      GLOBAL NEGATIVE CONSTRAINTS (Crucial):
      1. **DO NOT DO THE TASK.** If the user says "Write a email", do NOT write the email. Write the PROMPT that tells an AI to write the email.
      2. **NO CONVERSATION.** Do not say "Here is your optimized prompt". Just output the prompt text.

      ${styleInstruction}
      
      ${modelInstruction}
      `
    });

    // --- 4. EXECUTE ---
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
