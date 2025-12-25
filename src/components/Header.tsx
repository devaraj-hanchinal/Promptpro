
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Wand2, Menu, X } from "lucide-react";
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close menu when a link is clicked
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "History", href: "/history" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <Wand2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Prompt Pro
          </span>
        </Link>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="text-sm font-medium text-gray-600 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">Sign In</Button>
          </Link>
          <Link href="/auth?view=signUp">
             <Button className="bg-violet-600 hover:bg-violet-700 text-white">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button (Visible on Mobile) */}
        <button 
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link href="/auth" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-center">Sign In</Button>
              </Link>
              <Link href="/auth?view=signUp" onClick={closeMenu}>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white justify-center">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
