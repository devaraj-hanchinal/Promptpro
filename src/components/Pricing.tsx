"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out PromptPro",
    price: "₹0",
    period: "forever",
    features: [
      "5 prompt optimizations per day",
      "Basic optimization styles",
      "General AI model support",
      "Copy to clipboard",
      "No account required",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    description: "For power users and professionals",
    price: "₹99",
    originalPrice: "₹299",
    period: "per month",
    features: [
      "Unlimited prompt optimizations",
      "All optimization styles",
      "All AI model optimizations",
      "Priority processing",
      "Prompt history & favorites",
      "Advanced customization options",
      "Export prompts in multiple formats",
      "Priority email support",
      "Early access to new features",
    ],
    cta: "Start Free Trial",
    popular: true,
    badge: "🎉 Limited Time: FREE",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Special Launch Offer
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.popular 
                  ? "border-2 border-primary shadow-2xl shadow-primary/20 scale-105" 
                  : "border shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-bg text-white px-4 py-1 text-sm font-semibold">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                {plan.popular && (
                  <div className="flex justify-center mb-2">
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-6">
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>

                {plan.popular && (
                  <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      🎁 Premium is FREE for a limited time!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      No credit card required. Enjoy all premium features.
                    </p>
                  </div>
                )}

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? "gradient-bg hover:opacity-90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.popular && <Sparkles className="h-4 w-4 mr-2" />}
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            💳 No credit card required for free trial • Cancel anytime • 
            <span className="font-medium text-foreground"> 30-day money-back guarantee</span>
          </p>
        </div>
      </div>
    </section>
  );
}
