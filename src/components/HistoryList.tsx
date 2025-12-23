"use client";

import { useEffect, useState } from 'react';
import { getAppwriteDatabases, getAppwriteAccount } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Copy, Check, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function HistoryList() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const account = getAppwriteAccount();
      // 1. Get current user
      const user = await account.get();
      
      const databases = getAppwriteDatabases();
      
      // 2. Fetch documents belonging to this user
      const response = await databases.listDocuments(
        'prompt-pro-db',
        'history',
        [
          Query.equal('user_id', user.$id),     // Only show MY prompts
          Query.orderDesc('$createdAt'),        // Newest first
          Query.limit(20)                       // Max 20 items
        ]
      );
      setHistory(response.documents);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ description: "Copied to clipboard" });
  };

  if (loading) return <div className="text-center p-8 text-gray-500">Loading history...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent History</h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="text-gray-500">No history found. Optimize your first prompt!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div key={item.$id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
              {/* Header: Date & Model */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full">
                  {item.model || 'General'}
                </span>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(item.$createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Original Prompt (Truncated) */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{item.prompt}</p>
              </div>

              {/* Optimized Result (Truncated) */}
              <div className="mb-4 flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Optimized</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-3">{item.response}</p>
              </div>

              {/* Actions */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-auto"
                onClick={() => handleCopy(item.response, item.$id)}
              >
                {copiedId === item.$id ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
