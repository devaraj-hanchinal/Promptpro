"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  Layers, 
  Globe, 
  Shield, 
  Sparkles,
  MessageSquare,
  TrendingUp,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Optimization",
    description: "Transform your basic prompts into powerful instructions in seconds with our AI-powered engine.",
  },
  {
    icon: Target,
    title: "Model-Specific Tuning",
    description: "Optimize for ChatGPT, Claude, Gemini, or any AI model with tailored prompt structures.",
  },
  {
    icon: Layers,
    title: "Multiple Styles",
    description: "Choose from detailed, concise, creative, technical, or conversational output styles.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Use optimized prompts with any AI tool — ChatGPT, Claude, Gemini, Midjourney, and more.",
  },
  {
    icon: MessageSquare,
    title: "Better Responses",
    description: "Get more accurate, relevant, and comprehensive answers from AI with properly structured prompts.",
  },
  {
    icon: TrendingUp,
    title: "Improve Over Time",
    description: "Learn prompt engineering best practices as you see how your prompts are enhanced.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Stop spending hours crafting the perfect prompt. Let PromptPro do the heavy lifting.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your prompts are processed securely and never stored or shared with third parties.",
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    description: "Our optimization algorithms are constantly updated with the latest prompt engineering techniques.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">Prompt Pro</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our intelligent prompt optimizer helps you communicate more effectively with AI, 
            saving time and getting better results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
