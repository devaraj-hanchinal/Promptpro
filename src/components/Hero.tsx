import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Wand2, Star, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Trust Badge / Social Proof */}
        <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 mb-8 shadow-sm hover:shadow-md transition-all">
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces"
            ].map((src, i) => (
              <Avatar key={i} className="border-2 border-white w-6 h-6">
                <AvatarImage src={src} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Trusted by 10,000+ prompt engineers
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Transform Your Prompts Into <br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Powerful AI Instructions
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop getting average results. Our intelligent prompt optimizer helps you 
          communicate more effectively with ChatGPT, Claude, and Gemini.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="h-12 px-8 text-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            onClick={() => {
              document.getElementById('optimizer')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Start Optimizing Free
            <Wand2 className="ml-2 h-5 w-5" />
          </Button>
          <Link href="#features">
            <Button size="lg" variant="ghost" className="h-12 px-8 text-lg group">
              View Features
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
