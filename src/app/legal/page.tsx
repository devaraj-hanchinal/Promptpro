import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms & Privacy</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to Prompt Pro. By accessing our website, you agree to these terms. 
              We are dedicated to providing the best AI optimization service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Data Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We take your privacy seriously. Your prompts are processed securely and 
              we do not sell your personal data to third parties. History is stored 
              privately in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Premium Membership</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our "Launch Offer" grants 1 month of free Premium access. After this period, 
              users may choose to subscribe or revert to the free plan.
            </p>
          </section>

           <section>
            <h2 className="text-2xl font-semibold mb-4">4. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">
              For any legal concerns, please contact support@promptpro.dev
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
