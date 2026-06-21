"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function AIInsights() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching an insight from OpenAI API
    const fetchAI = async () => {
      // If we had a real key:
      // const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInsight("Our predictive models indicate a 94% retention rate this month. However, overtime in the Engineering department is up by 15%. Consider distributing workloads to prevent burnout.");
      setLoading(false);
    };

    fetchAI();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl border border-blue-500/20 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-gradient-x"></div>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
            AI Executive Summary
          </h3>
          
          {loading ? (
            <div className="space-y-2 mt-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6"></div>
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {insight}
            </p>
          )}
          
          {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !loading && (
             <div className="mt-4 inline-flex items-center text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
               ℹ️ Note: Set NEXT_PUBLIC_OPENAI_API_KEY to fetch live data. Displaying mock data.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
