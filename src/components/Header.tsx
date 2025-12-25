"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { getAppwriteAccount } from "@/lib/appwrite";
import { Menu, X, User, Crown, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  labels?: string[];
  prefs?: { plan?: string };
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const fetchUser = async () => {
      try {
        const account = getAppwriteAccount();
        const data = await account.get();
        setUser(data as any);

        const hasPremium =
          data.labels?.includes("premium") ||
          data.prefs?.plan === "premium";

        setIsPremium(hasPremium);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const account = getAppwriteAccount();
      await account.deleteSession("current");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "History", href: "/history" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white text-xs md:text-sm py-2 px-4 text-center font-medium relative z-[60]">
        🎉 New Year Offer: Use <span className="font-bold text-yellow-300">DA62</span> for 1 Month Free Premium!
      </div>

      <header
        className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO + BRAND */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:scale-110 duration-200">
              <Image src="/logo.jpg" alt="Prompt Pro Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
              Prompt Pro
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP USER BUTTON + PRO BUTTON */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20">
                    <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
                      <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isPremium && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                        <Crown className="w-3 h-3 fill-white" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth"><Button variant="ghost">Sign In</Button></Link>
            )}

            {!isPremium && (
              <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full px-6">
                <Link href="/#pricing">Use Promo Code</Link>
              </Button>
            )}
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(prev => !prev)}>
            {mobileMenuOpen ? <X className="text-gray-700" /> : <Menu className="text-gray-700" />}
          </button>
        </div>

        {/* 🚀 MOBILE MENU (ADDED) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 space-y-1 px-4 shadow-lg">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="block py-2 text-gray-700 dark:text-gray-200 font-medium hover:text-violet-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <button className="text-red-600 flex items-center gap-2 py-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              ) : (
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 text-left text-gray-700 dark:text-gray-200">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

