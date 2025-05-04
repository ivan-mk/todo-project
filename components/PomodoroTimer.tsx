import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { TimerDisplay } from './pomodoro/TimerDisplay';
import { TimerControls } from './pomodoro/TimerControls';
import { TimerSettings } from './pomodoro/TimerSettings';
import { fetchPomodoroState, sendPomodoroAction, fetchTimerSettings, saveTimerSettings } from './pomodoro/api';
import { TimerSettings as TimerSettingsType } from './pomodoro/types';

export default function PomodoroTimer() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const apiRequestInProgress = useRef(false);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [isLongBreak, setIsLongBreak] = useState<boolean>(false);
  
  // Settings state
  const [settings, setSettings] = useState<TimerSettingsType>({
    pomodoroDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    enableLongBreak: true,
    notificationSound: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/start.ogg',
    mute: false
  });

  // Play ring sound
  const playRing = () => {
    if (settings.mute) return;
    if (ringAudioRef.current) {
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current.play();
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    fetchTimerSettings().then(loadedSettings => {
      if (loadedSettings) {
        setSettings({
          ...settings,
          ...loadedSettings
        });
      }
    });
  }, [isAuthenticated]);

  // Update local state from API response
  const updateLocalState = (state: any) => {
    if (state) {
      setTimeLeft(state ? state.timeLeft : 0);
      setIsRunning(state.isRunning);
      setIsResting(state.isResting);
      setCompletedPomodoros(state.completedPomodoros);
      setIsLongBreak(state.isLongBreak);
      
      if (state.enableLongBreak !== undefined) {
        setSettings(prev => ({
          ...prev, 
          enableLongBreak: state.enableLongBreak,
          longBreakInterval: state.longBreakInterval || prev.longBreakInterval
        }));
      }
    }
    apiRequestInProgress.current = false;
    setButtonsDisabled(false);
    setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && !apiRequestInProgress.current) {
      apiRequestInProgress.current = true;
      setIsLoading(true);
      // First fetch the timer settings
      fetchTimerSettings().then(loadedSettings => {
        if (loadedSettings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...loadedSettings
          }));
          
          // Then fetch the timer state with the updated settings
          fetchPomodoroState().then(state => {
            updateLocalState(state);
            // Explicitly set timeLeft based on settings and state
            if (state && !state.isRunning) {
              setTimeLeft(state.isResting ? 
                (state.isLongBreak ? loadedSettings.longBreakDuration! * 60 : loadedSettings.breakDuration * 60) 
                : loadedSettings.pomodoroDuration * 60);
            } else {
              setTimeLeft(state ? state.timeLeft : 0);
            }
          });
        } else {
          // If no settings, just fetch the timer state
          fetchPomodoroState().then(updateLocalState);
        }
      });
    }
  }, [isAuthenticated]);

  // Timer interval
  useEffect(() => {
    if (!isAuthenticated || !isRunning) return;

    let timer: NodeJS.Timeout | undefined = undefined;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      playRing();
      if (!apiRequestInProgress.current) {
        apiRequestInProgress.current = true;
        setButtonsDisabled(true);
        
        sendPomodoroAction('finish', {
          pomodoroDuration: settings.pomodoroDuration,
          breakDuration: settings.breakDuration,
          longBreakDuration: settings.longBreakDuration,
          isLongBreak,
        }).then(updateLocalState);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isAuthenticated, settings, isLongBreak]);

  // Handle timer actions
  const handleAction = async (action: 'toggle' | 'reset' | 'skip') => {
    if (!isAuthenticated || apiRequestInProgress.current) return;
    
    setButtonsDisabled(true);
    apiRequestInProgress.current = true;
    
    if (action === 'toggle') {
      setIsRunning(!isRunning);
    } else if (action === 'reset') {
      // Update local timeLeft immediately when resetting
      setTimeLeft(isResting ? 
        (settings.enableLongBreak && isLongBreak ? settings.longBreakDuration! * 60 : settings.breakDuration * 60) 
        : settings.pomodoroDuration * 60);
    } else if (action === 'skip') {
      playRing();
    }
    
    // Always pass the current settings to the server
    const newState = await sendPomodoroAction(action, {
      pomodoroDuration: settings.pomodoroDuration,
      breakDuration: settings.breakDuration,
      longBreakDuration: settings.longBreakDuration,
      isLongBreak,
    });
    
    if (newState) {
      updateLocalState(newState);
      
      // For toggle and reset actions, explicitly set timeLeft based on settings
      if ((action === 'toggle' && !isRunning) || action === 'reset') {
        const newTimeLeft = !newState.isRunning ? newState.timeLeft :
          (newState.isResting ? 
            (newState.isLongBreak ? settings.longBreakDuration! * 60 : settings.breakDuration * 60) 
            : settings.pomodoroDuration * 60);
        
        setTimeLeft(newTimeLeft);
      }
    }
  };

  const handleSaveSettings = async () => {
    setButtonsDisabled(true);
    await saveTimerSettings(settings);
    setShowSettings(false);
    
    if (!isRunning) {
      setTimeLeft(isResting ? 
        (settings.enableLongBreak && isLongBreak ? settings.longBreakDuration! * 60 : settings.breakDuration * 60) 
        : settings.pomodoroDuration * 60);
    }
    
    setButtonsDisabled(false);
  };

  // Display logic
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isAuthenticated) {
    return (
      <div className="pomodoro-timer text-center mb-4 p-3 md:p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg md:text-xl font-bold text-gray-700 mb-2">Pomodoro Timer</h2>
        <p className="text-gray-600 mb-1">Sign in to use the Pomodoro timer</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 text-center mb-4 relative">
        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
          Loading Timer...
        </h2>
        <div className="animate-pulse h-10 bg-white bg-opacity-20 rounded-lg mb-3"></div>
        <div className="flex flex-wrap md:flex-nowrap justify-center gap-1 md:space-x-3">
          <div className="animate-pulse h-8 w-20 bg-white bg-opacity-20 rounded-lg"></div>
          <div className="animate-pulse h-8 w-20 bg-white bg-opacity-20 rounded-lg"></div>
          <div className="animate-pulse h-8 w-20 bg-white bg-opacity-20 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 py-2 text-center mb-4 relative">
      <audio ref={ringAudioRef} src={settings.notificationSound} preload="auto" />
      
      <button
        className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
      >
        <Cog6ToothIcon className="w-5 h-5" />
      </button>
      
      {showSettings && (
        <TimerSettings
          settings={settings}
          onUpdateSettings={setSettings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          buttonsDisabled={buttonsDisabled}
          playSound={playRing}
        />
      )}
      
      <TimerDisplay
        minutes={minutes}
        seconds={seconds}
        isResting={isResting}
        isLongBreak={isLongBreak}
        completedPomodoros={completedPomodoros}
        longBreakInterval={settings.longBreakInterval || 4}
      />
      
      <TimerControls
        isRunning={isRunning}
        toggleTimer={() => handleAction('toggle')}
        resetTimer={() => handleAction('reset')}
        skipTimer={() => handleAction('skip')}
        buttonsDisabled={buttonsDisabled}
        completedPomodoros={completedPomodoros}
      />
    </div>
  );
}