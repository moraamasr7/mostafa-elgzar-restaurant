"use client";

import { useEffect, useState } from "react";
import { isRestaurantOpen, OperatingHoursResult } from "@/lib/schedule";
import { Clock } from "lucide-react";

export default function LiveStoreBadge() {
  const [status, setStatus] = useState<OperatingHoursResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      try {
        const res = await isRestaurantOpen();
        if (isMounted) {
          setStatus(res);
          setIsLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkStatus();

    // Recheck status every 5 minutes to stay accurate
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading || !status) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-200/50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[11px] text-stone-400 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        <span>جاري التحقق...</span>
      </div>
    );
  }

  if (status.isOpen) {
    const closeTimeDisplay = status.currentWindow?.close
      ? ` (يغلق ${status.currentWindow.close})`
      : "";

    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold shadow-xs transition-colors"
        title={status.reason}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="whitespace-nowrap">مفتوح للطلبات{closeTimeDisplay}</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold shadow-xs transition-colors"
      title={status.reason}
    >
      <Clock className="w-3 h-3 text-rose-500 shrink-0" />
      <span className="whitespace-nowrap">مغلق حالياً</span>
    </div>
  );
}
