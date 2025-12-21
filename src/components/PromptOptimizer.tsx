"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, Wand2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


const AI_MODELS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "llama", label: "Llama" },
  { value: "general", label: "General Purpose" },
];

const PROMPT_STYLES = [
  { value: "detailed", label: "Detailed & Comprehensive" },
  { value: "concise", label: "Concise & Direct" },
  { value: "creative", label: "Creative & Imaginative" },
  { value: "technical", label: "Technical & Precise" },
  { value: "conversational", label: "Conversational" },
];

export default function PromptOptimizer() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("general");
  const [selectedStyle, setSelectedStyle] = useState("detailed");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const { toast } = useToast();

  const FREE_LIMIT = 5;

  const optimizePrompt = async () => {
    if (!inputPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to optimize.",
        variant: "destructive",
      });
      return;
    }

    if (usageCount >= FREE_LIMIT) {
      toast({
        title: "Free Limit Reached",
        description: "Upgrade to Premium for unlimited optimizations!",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const response = await fetch('/api/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt: inputPrompt,
      model: selectedModel,
      style: selectedStyle
    }),
  });

      const data = await response.json();
      const error = !response.ok ? { message: data.error || 'Failed to optimize prompt' } : null;

      if (error) {
        throw new Error(error.message || 'Failed to optimize prompt');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const optimized = data.optimizedPrompt;
      
      setOptimizedPrompt(optimized);
      setUsageCount((prev) => prev + 1);

      toast({
        title: "Prompt Optimized!",
        description: "Your prompt has been enhanced using ChatGPT.",
      });
    } catch (error: any) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizePromptOld = async () => {
    if (!inputPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to optimize.",
        variant: "destructive",
      });
      return;
    }

    if (usageCount >= FREE_LIMIT) {
      toast({
        title: "Free Limit Reached",
        description: "Upgrade to Premium for unlimited optimizations!",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    // Simulate AI optimization (in production, this would call an API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const modelName = AI_MODELS.find((m) => m.value === selectedModel)?.label || "AI";
    const styleName = PROMPT_STYLES.find((s) => s.value === selectedStyle)?.label || "detailed";

    // Generate optimized prompt based on style
    let optimized = "";
    
    switch (selectedStyle) {
      case "detailed":
        optimized = `You are an expert assistant. I need your help with the following task:

**Context:** ${inputPrompt}

**Requirements:**
- Provide a comprehensive and well-structured response
- Include relevant examples where appropriate
- Consider multiple perspectives and edge cases
- Format the output for easy readability

**Expected Output Format:**
Please structure your response with clear headings, bullet points where appropriate, and a summary at the end.

**Additional Notes:**
- If any clarification is needed, please ask before proceeding
- Prioritize accuracy and completeness over brevity`;
        break;
      case "concise":
        optimized = `Task: ${inputPrompt}

Instructions:
- Be direct and to the point
- Provide only essential information
- Use bullet points for clarity
- Maximum 3-5 key points

Respond concisely.`;
        break;
      case "creative":
        optimized = `🎨 Creative Challenge:

"${inputPrompt}"

Guidelines for your response:
• Think outside the box - unconventional ideas welcome
• Use vivid language and engaging storytelling
• Include metaphors or analogies if helpful
• Feel free to explore multiple creative angles
• Make it memorable and inspiring

Let your creativity flow!`;
        break;
      case "technical":
        optimized = `**Technical Request**

Objective: ${inputPrompt}

Requirements:
1. Provide technically accurate information
2. Include code examples/specifications where relevant
3. Reference best practices and standards
4. Consider performance and scalability implications
5. Note any potential limitations or trade-offs

Output Format: Structured technical documentation with clear sections.`;
        break;
      case "conversational":
        optimized = `Hey! I'd love your help with something.

${inputPrompt}

Feel free to ask me any follow-up questions if you need more context. I'm looking for a friendly, easy-to-understand explanation. Thanks!`;
        break;
      default:
        optimized = inputPrompt;
    }

    // Add model-specific optimization hints
    if (selectedModel === "chatgpt") {
      optimized += "\n\n[Optimized for ChatGPT - Uses clear structure and explicit instructions]";
    } else if (selectedModel === "claude") {
      optimized += "\n\n[Optimized for Claude - Emphasizes context and nuanced understanding]";
    } else if (selectedModel === "gemini") {
      optimized += "\n\n[Optimized for Gemini - Balanced for multimodal capabilities]";
    }

    setOptimizedPrompt(optimized);
    setUsageCount((prev) => prev + 1);
    setIsOptimizing(false);

    toast({
      title: "Prompt Optimized! ✨",
      description: "Your prompt has been enhanced for better AI responses.",
    });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Optimized prompt copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputPrompt("");
    setOptimizedPrompt("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            {FREE_LIMIT - usageCount} free optimizations remaining
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your <span className="gradient-text">Prompts</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your basic prompt below and watch it transform into a powerful, 
            optimized instruction that gets better results from any AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Input Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Your Prompt
              </CardTitle>
              <CardDescription>
                Enter the prompt you want to optimize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Write a blog post about AI..."
                className="min-h-[200px] resize-none"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target AI Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Style</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 gradient-bg hover:opacity-90 gap-2"
                  onClick={optimizePrompt}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Optimize Prompt
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Optimized Prompt
              </CardTitle>
              <CardDescription>
                Your enhanced, AI-ready prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Your optimized prompt will appear here..."
                  className="min-h-[200px] resize-none bg-background"
                  value={optimizedPrompt}
                  readOnly
                />
                {optimizedPrompt && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>

              {optimizedPrompt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Paste this optimized prompt into your favorite AI tool</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
