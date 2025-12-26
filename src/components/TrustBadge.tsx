"use client";

import { Star } from "lucide-react";

const AVATARS = [
  "photo-1534528741775-53994a69daeb",
  "photo-1506794778202-cad84cf45f1d",
  "photo-1517841905240-472988babdf9",
  "photo-1500648767791-00dcc994a43e",
  "photo-1544005313-94ddf0286df2",
].map(id => ({
  alt: "Profile picture",
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=64&h=64&q=80`,
}));

export default function TrustBadge() {
  return (
    <div className="flex w-full justify-center mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="inline-flex items-center gap-3 py-2 px-4 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">

        {/* Avatars */}
        <div className="flex items-center -space-x-3 rtl:space-x-reverse">
          {AVATARS.map((item, index) => (
            <div
              key={index}
              className="relative w-8 h-8 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800"
            >
              <img
                src={item.url}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Rating + Text */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Trusted by{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              12,000+
            </span>{" "}
            creators
          </span>
        </div>

      </div>
    </div>
  );
}
