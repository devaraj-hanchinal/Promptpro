import { Suspense } from "react";
import PromptOptimizer from "@/components/PromptOptimizer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-[#020817]">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-12 px-4">
        {/* The Suspense boundary fixes the build error */}
        <Suspense 
          fallback={
            <div className="flex items-center justify-center w-full h-96">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          }
        >
          <PromptOptimizer />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
