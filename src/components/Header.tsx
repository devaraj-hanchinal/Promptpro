"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image for the logo
import { Button } from "@/components/ui/button";
import { getAppwriteAccount } from "@/lib/appwrite";
import { Menu, X, User, Crown, LogOut } from "lucide-react"; // Import Crown icon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define the User interface locally to include labels
interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  labels?: string[]; // We need labels to check for 'premium'
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    const checkUser = async () => {
      try {
        const account = getAppwriteAccount();
        const currentUser = await account.get();
        setUser(currentUser as unknown as AppwriteUser);
        
        // Check if user has 'premium' label
        if ((currentUser as any).labels && (currentUser as any).labels.includes('premium')) {
          setIsPremium(true);
        }
      } catch (err) {
        setUser(null);
      }
    };
    checkUser();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const account = getAppwriteAccount();
      await account.deleteSession('current');
      setUser(null);
      setIsPremium(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'History', href: '/history' }, // CHANGED: Now points to separate page
    { name: 'Pricing', href: '/#pricing' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || mobileMenuOpen ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-2">
          {/* Using your uploaded logo.jpg */}
          <div className="relative w-8 h-8 md:w-10 md:h-10">
             <Image 
               src="/logo.jpg" 
               alt="PromptPro Logo" 
               fill 
               className="object-contain"
             />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Prompt Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  {/* PREMIUM BADGE INDICATOR */}
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white" title="Premium User">
                      <Crown className="w-3 h-3 fill-white" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      {isPremium && <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded font-bold">PRO</span>}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="text-sm font-medium">Sign In</Button>
            </Link>
          )}
          
          {!isPremium && (
            <Link href="/#pricing">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-full px-6">
                Get Premium
                </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="block p-2 text-base font-medium text-gray-600 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
          {user ? (
             <Button variant="outline" onClick={handleLogout} className="w-full justify-start text-red-600">
                Log Out
             </Button>
          ) : (
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
