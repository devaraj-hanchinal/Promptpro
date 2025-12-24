import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TrustBadge() {
  const users = [
    { id: 1, src: "https://i.pravatar.cc/100?img=1" },
    { id: 2, src: "https://i.pravatar.cc/100?img=2" },
    { id: 3, src: "https://i.pravatar.cc/100?img=3" },
    { id: 4, src: "https://i.pravatar.cc/100?img=4" },
  ];

  return (
    <div className="flex justify-center my-8">
      <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full pl-2 pr-6 py-2 shadow-sm">
        <div className="flex -space-x-3">
          {users.map((user) => (
            <Avatar key={user.id} className="border-2 border-white dark:border-gray-800 w-8 h-8">
              <AvatarImage src={user.src} alt={`User ${user.id}`} />
              <AvatarFallback>U{user.id}</AvatarFallback>
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
