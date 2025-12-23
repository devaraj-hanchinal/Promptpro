import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Prompt History</h1>
            <p className="text-gray-500 mb-8">Access your saved optimizations and results.</p>
            
            {/* The History Component */}
            <HistoryList />
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
