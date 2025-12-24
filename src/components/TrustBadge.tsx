import { Star } from "lucide-react";
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
