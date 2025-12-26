"use client";

import Image from "next/image";

// Using reliable, professional-looking avatar URLs
const AVATARS = [
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop",
    alt: "Creator 1",
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&q=80&fit=crop",
    alt: "Creator 2",
  },
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&fit=crop",
    alt: "Creator 3",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=80&fit=crop",
    alt: "Creator 4",
  },
];

export default function TrustBadge() {
  return (
    <div className="flex items-center justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
        
        {/* Avatar Group */}
        <div className="flex -space-x-3">
          {AVATARS.map((avatar, i) => (
            <div 
              key={i} 
              className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
            >
              <Image
                src={avatar.src}
                alt={avatar.alt}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
          Trusted by <span className="text-gray-900 dark:text-white font-bold">12,000+</span> creators
          <span className="text-yellow-400 text-lg leading-none">★</span>
        </div>
      </div>
    </div>
  );
}import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TrustBadge() {
  // Using reliable placeholder avatars
  const users = [
    { id: 1, src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" },
    { id: 2, src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" },
    { id: 3, src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
    { id: 4, src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo" },
  ];

  return (
    <div className="flex justify-center mb-8 mt-2">
      <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full pl-2 pr-6 py-2 shadow-sm transform hover:scale-105 transition-transform duration-300">
        <div className="flex -space-x-3">
          {users.map((user) => (
            <Avatar key={user.id} className="border-2 border-white dark:border-gray-800 w-8 h-8">
              <AvatarImage src={user.src} alt="User" />
              <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">U{user.id}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Trusted by 12,000+ creators
          </span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}
