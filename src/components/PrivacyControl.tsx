"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Loader2 
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // * You may need to install this or use standard buttons if you prefer

interface PrivacyControlProps {
  isIncognito: boolean;
  onToggleIncognito: () => void;
  onClearHistory: () => Promise<void>;
}

export default function PrivacyControl({ 
  isIncognito, 
  onToggleIncognito, 
  onClearHistory 
}: PrivacyControlProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onClearHistory();
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
      
      {/* 1. INCOGNITO TOGGLE */}
      <Button
        variant={isIncognito ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleIncognito}
        className={`gap-2 transition-all ${isIncognito ? "bg-amber-600 hover:bg-amber-700 border-amber-600 text-white" : "text-gray-600"}`}
        title={isIncognito ? "History is OFF" : "History is ON"}
      >
        {isIncognito ? (
          <>
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Private Mode On</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">History On</span>
          </>
        )}
      </Button>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* 2. CLEAR HISTORY BUTTON */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        <span className="hidden sm:inline">Clear History</span>
      </Button>
    </div>
  );
}
