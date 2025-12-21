"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is PromptPro?",
    answer: "PromptPro is an AI-powered prompt optimization tool that transforms your basic prompts into powerful, well-structured instructions. It helps you get better, more accurate responses from AI tools like ChatGPT, Claude, Gemini, and more.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No! You can start using PromptPro immediately without creating an account. Sign up is completely optional and only needed if you want to save your prompt history or access premium features.",
  },
  {
    question: "How many free optimizations do I get?",
    answer: "Free users get 5 prompt optimizations per day. This resets every 24 hours. For unlimited optimizations, you can upgrade to our Premium plan.",
  },
  {
    question: "Is Premium really free right now?",
    answer: "Yes! For a limited time, we're offering Premium access completely free. This is a launch promotion to help users experience all the powerful features PromptPro has to offer. The regular price will be ₹99/month after the promotion ends.",
  },
  {
    question: "Which AI models does PromptPro support?",
    answer: "PromptPro optimizes prompts for all major AI models including ChatGPT (GPT-3.5/GPT-4), Claude, Google Gemini, Llama, and more. You can select your target model for tailored optimization.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We take privacy seriously. Your prompts are processed securely and are never stored permanently or shared with third parties. We don't use your prompts to train any AI models.",
  },
  {
    question: "Can I use optimized prompts commercially?",
    answer: "Yes! All prompts you create and optimize using PromptPro are yours to use however you like, including for commercial purposes.",
  },
  {
    question: "How do I cancel my Premium subscription?",
    answer: "You can cancel your Premium subscription anytime from your account settings. There are no cancellation fees, and you'll continue to have access until the end of your billing period.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Got questions? We've got answers. If you can't find what you're looking for, 
            feel free to reach out to us.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-lg border px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
