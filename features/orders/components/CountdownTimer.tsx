'use client';

import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

export default function CountdownTimer({
  initialMinutes = 10,
  onExpire,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formattedTime = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-between text-gold-700 dark:text-gold-400 bg-gold-500/10 dark:bg-gold-500/15 p-3 rounded-xl border border-gold-500/30">
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 animate-pulse text-gold-600 dark:text-gold-400" />
        <span className="font-bold text-xs">مهلة تأكيد التحويل المسبق:</span>
      </div>
      <span className="font-mono font-black text-base tracking-widest tabular-nums" dir="ltr">
        {formattedTime}
      </span>
    </div>
  );
}
