"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

export function SkillExtractionStatus({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Listen to changes on the participants table for this user
    const channel = supabase
      .channel('skill-extraction')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime payload received:", payload);
          // Check if skill_vector is populated with actual skills (not just processing)
          if (payload.new && payload.new.skill_vector && payload.new.skill_vector.status !== 'processing') {
            setIsProcessing(false);
            // Refresh the server component to load the new skills!
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router, supabase]);

  if (!isProcessing) return null; // Component hides itself once done

  return (
    <div className="w-full mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center space-x-4">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <Sparkles className="w-4 h-4 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-medium text-purple-200">AI Processing Resume</h3>
        <p className="text-sm text-purple-400/80 animate-pulse">
          Our background agents are extracting deep skills from your resume...
        </p>
      </div>
    </div>
  );
}
