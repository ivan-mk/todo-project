import React from 'react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isResting: boolean;
  isLongBreak: boolean;
  completedPomodoros: number;
  longBreakInterval: number;
}

export function TimerDisplay({
  minutes,
  seconds,
  isResting,
  isLongBreak,
  completedPomodoros,
  longBreakInterval
}: TimerDisplayProps) {
  // Limit the display to a maximum of 7 breaks
  const displayInterval = Math.min(longBreakInterval, 7);
  
  return (
    <>
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1 md:mb-2">
        {isResting ? (isLongBreak ? 'Long Break' : 'Break Time') : 'Focus Time'}
      </h2>
      
      <div className="text-5xl md:text-6xl font-mono text-white mb-3 md:mb-4 drop-shadow-lg">
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </div>
    </>
  );
}