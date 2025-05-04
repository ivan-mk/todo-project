import { PomodoroState, PomodoroAction, TimerSettings } from './types';

// API interaction functions
export async function fetchPomodoroState(): Promise<PomodoroState | null> {
  try {
    const response = await fetch('/api/pomodoro', { method: 'GET' });
    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      // Don't log errors for authentication issues
      return null;
    } else {
      console.error('Failed to fetch Pomodoro state:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Pomodoro state:', error);
    return null;
  }
}

export async function sendPomodoroAction(
  action: PomodoroAction,
  settings?: {
    pomodoroDuration: number;
    breakDuration: number;
    longBreakDuration?: number;
    isLongBreak?: boolean;
  }
): Promise<PomodoroState | null> {
  try {
    const response = await fetch('/api/pomodoro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action,
        ...settings // Include custom time settings
      }),
    });
    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      // Don't log errors for authentication issues
      return null;
    } else {
      console.error(`Failed to perform action ${action}:`, response.statusText);
      return null;
    }
  } catch (error) {
    console.error(`Error performing action ${action}:`, error);
    return null;
  }
}

export async function saveTimerSettings(settings: TimerSettings): Promise<boolean> {
  try {
    const response = await fetch('/api/pomodoro/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function fetchTimerSettings(): Promise<TimerSettings | null> {
  try {
    const response = await fetch('/api/pomodoro/settings', { method: 'GET' });
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}