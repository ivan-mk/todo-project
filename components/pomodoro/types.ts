// Define Pomodoro state type based on API response
export interface PomodoroState {
  id: string;
  userId: string;
  isResting: boolean;
  isRunning: boolean;
  startTime: string | null; // ISO string or null
  remainingTime: number | null;
  completedPomodoros: number;
  isLongBreak: boolean;
  createdAt: string;
  updatedAt: string;
  timeLeft: number; // Calculated by backend
  // Settings that affect UI state
  enableLongBreak?: boolean;
  longBreakInterval?: number;
}

// Notification sound options
export const notificationSounds = [
  { name: 'Guitar', url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/start.ogg' },
];

export interface TimerSettings {
  pomodoroDuration: number;
  breakDuration: number;
  longBreakDuration?: number;
  longBreakInterval?: number;
  enableLongBreak?: boolean;
  notificationSound?: string;
  mute?: boolean;
}

export type PomodoroAction = 'toggle' | 'reset' | 'skip' | 'finish';