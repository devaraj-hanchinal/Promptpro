"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, Crown, Loader2, LogOut } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAppwriteAccount, AppwriteUser, ID } from "@/lib/appwrite";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [account] = useState(() => getAppwriteAccount());
  const { toast } = useToast();

  useEffect(() => {
    if (!account) {
      setIsCheckingAuth(false);
      return;
    }
    
    // Check initial auth state
    const checkUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser as unknown as AppwriteUser);
      } catch {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [account]);

  const handleSignOut = async () => {
    if (!account) return;
    try {
      await account.deleteSession("current");
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    return user?.name || user?.email || "User";
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        title: "Configuration Error",
        description: "Appwrite is not configured. Please check environment variables.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      await account.createEmailPasswordSession(signInEmail, signInPassword);
      const currentUser = await account.get();
      setUser(currentUser as unknown as AppwriteUser);
      console.log("Sign in successful:", currentUser);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setAuthOpen(false);
      setSignInEmail("");
      setSignInPassword("");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SIGNUP HANDLER CALLED");

    // Get fresh account instance
    const appwriteAccount = getAppwriteAccount();
    
    console.log("Account instance:", appwriteAccount);
    console.log("Creating account with:", { email: signUpEmail, name: signUpName, password: "***" });
    
    setIsLoading(true);

    try {
      // Step 1: Create user account
      const newUser = await appwriteAccount.create(
        ID.unique(),
        signUpEmail,
        signUpPassword,
        signUpName
      );
      console.log("USER CREATED:", newUser);
      
      // Step 2: Auto-login after signup
      const session = await appwriteAccount.createEmailPasswordSession(signUpEmail, signUpPassword);
      console.log("SESSION CREATED:", session);
      
      // Step 3: Get current user and update state
      const currentUser = await appwriteAccount.get();
      console.log("CURRENT USER:", currentUser);
      setUser(currentUser as unknown as AppwriteUser);

      toast({
        title: "Account Created!",
        description: "Your account has been created successfully.",
      });
      setAuthOpen(false);
      setSignUpName("");
      setSignUpEmail("");
      setSignUpPassword("");
    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.jpg" 
            alt="PromptPro.dev Logo" 
            width={140} 
            height={40} 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isCheckingAuth ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-bg text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="#pricing">
                <Button size="sm" className="gradient-bg hover:opacity-90 gap-2">
                  <Crown className="h-4 w-4" />
                  Get Premium
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-center gradient-text text-2xl">Welcome to PromptPro</DialogTitle>
                    <DialogDescription className="text-center">
                      Sign in or create an account to save your prompts
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="signin" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin" className="space-y-4 mt-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="you@example.com"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full gradient-bg hover:opacity-90" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Sign In
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          By signing in, you agree to our Terms of Service
                        </p>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup" className="space-y-4 mt-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input 
                            id="signup-email" 
                            type="email" 
                            placeholder="you@example.com"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input 
                            id="signup-password" 
                            type="password" 
                            placeholder="••••••••"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full gradient-bg hover:opacity-90" 
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Create Account
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          By signing up, you agree to our Terms of Service
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Link href="#pricing">
                <Button size="sm" className="gradient-bg hover:opacity-90 gap-2">
                  <Crown className="h-4 w-4" />
                  Get Premium
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="gradient-bg text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}>
                  Sign In
                </Button>
              )}
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gradient-bg hover:opacity-90 gap-2">
                  <Crown className="h-4 w-4" />
                  Get Premium
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
