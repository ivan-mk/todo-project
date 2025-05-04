import React from 'react';

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  buttonsDisabled: boolean;
  completedPomodoros: number;
}

export function TimerControls({
  isRunning,
  toggleTimer,
  resetTimer,
  skipTimer,
  buttonsDisabled,
  completedPomodoros
}: TimerControlsProps) {
  return (
    <>
      <div className="flex flex-nowrap justify-center gap-1 md:gap-2 mb-1">
        <button
          onClick={toggleTimer}
          disabled={buttonsDisabled}
          className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base font-bold rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 min-w-[70px] md:min-w-[100px] 
            ${isRunning 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-500 hover:bg-green-600'
            } 
            ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={resetTimer}
          disabled={buttonsDisabled}
          className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base font-bold rounded-full shadow-md bg-blue-500 hover:bg-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 min-w-[70px] md:min-w-[100px] ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Reset
        </button>
        
        <button
          onClick={skipTimer}
          disabled={buttonsDisabled}
          className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base font-bold rounded-full shadow-md bg-yellow-500 hover:bg-yellow-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 min-w-[70px] md:min-w-[100px] ${buttonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Skip
        </button>
      </div>
      
      {/* Display current pomodoro count */}
      <div className="mt-1 text-white text-opacity-80 text-sm">
        Completed: {completedPomodoros} {completedPomodoros === 1 ? 'pomodoro' : 'pomodoros'}
      </div>
    </>
  );
}