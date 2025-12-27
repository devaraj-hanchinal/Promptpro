"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PromptOptimizer from "@/components/PromptOptimizer";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        
        <div id="optimizer">
          <PromptOptimizer />
        </div>

        {/* The HistoryList component has been moved to /history/page.tsx */}

        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
