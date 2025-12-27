import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, style, model } = await req.json();
    
    // 1. Secure Check for API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- 2. DEFINE STYLE RULES (Length & Tone) ---
    let styleInstruction = "";
    
    switch (style) {
      case "Concise & Direct":
        styleInstruction = `
        STYLE: CONCISE
        - Length Limit: Strict maximum of 30-40 words.
        - Structure: Single paragraph. Direct command.
        - Tone: Clinical, robotic, zero fluff.
        - Example: "Write a Python script to scrape X using BeautifulSoup." (No 'please', no context).
        `;
        break;
      case "Detailed & Comprehensive":
        styleInstruction = `
        STYLE: DETAILED MEGA-PROMPT
        - Length Limit: Minimum 100 words.
        - Required Structure:
          1. **Persona:** (e.g., "Act as a Senior Engineer")
          2. **Context:** (Invent a plausible scenario if user didn't provide one)
          3. **Task:** (The core instruction)
          4. **Constraints:** (Format, tone, specific exclusions)
        - Goal: Create a robust, bulletproof set of instructions.
        `;
        break;
      case "Creative & Engaging":
        styleInstruction = `
        STYLE: CREATIVE
        - Focus: Use evocative adjectives, specify mood/vibe, and encourage "out of the box" thinking.
        - Length: Medium (60-80 words).
        `;
        break;
      case "Technical & Precise":
        styleInstruction = `
        STYLE: TECHNICAL
        - Focus: Emphasize accuracy, standards (ISO, coding conventions), and edge cases.
        - Length: Medium (60-80 words).
        `;
        break;
      default:
        styleInstruction = "STYLE: Professional and clear (approx 50 words).";
    }

    // --- 3. DEFINE MODEL SPECIFIC RULES ---
    let modelInstruction = "";

    if (model.includes("Midjourney")) {
      modelInstruction = "Target: Midjourney. Focus on visual descriptors (lighting, style, camera). End with parameters like '--ar 16:9 --v 6'.";
    } else if (model.includes("DALL-E")) {
      modelInstruction = "Target: DALL-E 3. Be descriptive about composition. Use natural language.";
    } else if (model.includes("GPT-4")) {
      modelInstruction = "Target: GPT-4. Use 'Chain of Thought' (Let's think step by step) and Persona definition.";
    } else if (model.includes("Gemini")) {
      // <--- SPECIFIC GEMINI LOGIC
      modelInstruction = `
      Target: Google Gemini. 
      - Gemini excels at logical reasoning and multimodal context.
      - Structure the prompt to ask for "Reasoning first, then Answer".
      - Use clear delimiters (like ###) to separate sections.
      `;
    } else {
      modelInstruction = "Target: General LLM. Keep it universal.";
    }

    // --- 4. CONFIGURE THE AI ---
    // Using gemini-2.5-flash as per your setup
    const aiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are PromptPro, an expert AI Prompt Engineer.
      
      YOUR GOAL:
      Rewrite the user's raw input into a professional, high-performance prompt.

      GLOBAL RULES (DO NOT IGNORE):
      1. **DO NOT EXECUTE THE TASK.** If the user says "Write a email", do NOT write the email. Write the PROMPT that tells an AI *how* to write the email.
      2. **NO META-TALK.** Do not say "Here is your prompt" or "I have optimized it". Just output the final prompt text.
      3. **STRICT LENGTH ADHERENCE.** If the style is concise, keep it short. If detailed, make it long.

      ${styleInstruction}
      
      ${modelInstruction}
      `
    });

    // --- 5. EXECUTE ---
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
