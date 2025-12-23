import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
               <div className="relative w-6 h-6">
                 <Image src="/logo.jpg" alt="Prompt Pro" fill className="object-contain" />
               </div>
               <span className="font-bold text-lg text-gray-900 dark:text-white">Prompt Pro</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Empowering creators with AI-optimized prompts. Turn simple ideas into professional results instantly.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/#features" className="hover:text-violet-600 transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-violet-600 transition-colors">Pricing</Link></li>
              <li><Link href="/history" className="hover:text-violet-600 transition-colors">History</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-violet-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">support@promptpro.dev</p>
             <div className="flex gap-4">
               {/* You can add social icons here later */}
             </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Prompt Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
