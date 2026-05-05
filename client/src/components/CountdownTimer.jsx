import { useState, useEffect } from "react";

export default function CountdownTimer({ deadline, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(deadline) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    } else {
      timeLeft = { total: 0 };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.total === 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800/50 ${className}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Voting Ended
      </div>
    );
  }

  const isNearingEnd = timeLeft.total < 1000 * 60 * 60 * 24; // Less than 24 hours
  const isUrgent = timeLeft.total < 1000 * 60 * 60; // Less than 1 hour

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${
      isUrgent 
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 animate-pulse" 
        : isNearingEnd
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400"
          : "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400"
    } ${className}`}>
      <svg className={`w-4 h-4 ${isUrgent ? 'animate-spin-slow' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      
      <div className="flex items-baseline gap-1 font-mono font-bold text-sm tracking-tight">
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days}</span>
            <span className="text-[10px] uppercase font-bold opacity-70 mr-1">d</span>
          </>
        )}
        <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold opacity-70">h</span>
        <span className="animate-pulse opacity-50">:</span>
        <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold opacity-70">m</span>
        {isNearingEnd && (
          <>
            <span className="animate-pulse opacity-50">:</span>
            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold opacity-70">s</span>
          </>
        )}
        <span className="ml-1 text-[10px] uppercase font-bold opacity-70 tracking-normal font-sans">left</span>
      </div>
    </div>
  );
}
