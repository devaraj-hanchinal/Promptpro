"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from "@/components/ui/button";
import { getAppwriteAccount } from "@/lib/appwrite";
import { Menu, X, User, Crown, LogOut } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  labels?: string[];
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
    { name: 'Home', href: '/' },      // <--- ADDED HOME BUTTON
    { name: 'Features', href: '/#features' },
    { name: 'History', href: '/history' }, 
    { name: 'Pricing', href: '/#pricing' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || mobileMenuOpen ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:scale-110 duration-200">
             <Image 
               src="/logo.jpg" 
               alt="Prompt Pro Logo" 
               fill 
               className="object-contain"
             />
          </div>
          {/* RENAMED TO PROMPT PRO */}
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
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
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                  <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
                    <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white shadow-sm" title="Premium User">
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
                      {isPremium && <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">PRO</span>}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="text-sm font-medium hover:text-violet-600">Sign In</Button>
            </Link>
          )}
          
          {!isPremium && (
            <Link href="/#pricing">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-full px-6 transition-all hover:scale-105 active:scale-95">
                Get Premium
                </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="text-gray-600" /> : <Menu className="text-gray-600" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="block p-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
          {user ? (
             <Button variant="outline" onClick={handleLogout} className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
             </Button>
          ) : (
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-violet-600 text-white">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
