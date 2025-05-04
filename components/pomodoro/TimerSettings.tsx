import React, { useState } from 'react';
import { notificationSounds, TimerSettings as TimerSettingsType } from './types';

// Custom Number input component with + and - controls
const NumberInput = ({ 
  value, 
  onChange, 
  min, 
  max, 
  label,
  maxLength = 3
}: { 
  value: number; 
  onChange: (value: number) => void; 
  min: number; 
  max: number; 
  label: string;
  maxLength?: number;
}) => {
  const incrementValue = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrementValue = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      // Clamp value between min and max
      const clampedValue = Math.min(Math.max(newValue, min), max);
      onChange(clampedValue);
    }
  };

  return (
    <div className="mb-5 flex items-center justify-between">
      <label className="text-lg font-medium">{label}</label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrementValue}
          className="h-10 w-10 rounded-l-md bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Decrease value"
        >
          <span className="text-xl">−</span>
        </button>
        
        <div className="relative w-20">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            className="h-10 w-full border-y border-gray-300 text-center focus:outline-none focus:border-purple-500"
            style={{ 
              appearance: "textfield",
              MozAppearance: "textfield",
              WebkitAppearance: "none"
            }}
            aria-label={`${label} value`}
            maxLength={maxLength}
          />
          {/* Hide spinner buttons */}
          <style jsx>{`
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}</style>
        </div>
        
        <button
          type="button"
          onClick={incrementValue}
          className="h-10 w-10 rounded-r-md bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Increase value"
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
};

// Toggle switch component for settings
const ToggleSwitch = ({ 
  isChecked, 
  onChange, 
  label 
}: { 
  isChecked: boolean; 
  onChange: (checked: boolean) => void; 
  label: string 
}) => (
  <div className="mb-5 flex items-center justify-between">
    <label className="text-lg font-medium">{label}</label>
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked)}
        id={`toggle-${label}`}
      />
      <div 
        className={`block w-16 h-9 rounded-full ${isChecked ? 'bg-purple-600' : 'bg-gray-300'} cursor-pointer transition-colors touch-manipulation`}
        onClick={() => onChange(!isChecked)}
        role="switch"
        aria-checked={isChecked}
      ></div>
      <div 
        className={`absolute left-1 top-1 bg-white w-7 h-7 rounded-full shadow-md transition-transform ${
          isChecked ? 'transform translate-x-7' : ''
        } touch-manipulation`}
        onClick={() => onChange(!isChecked)}
      ></div>
    </div>
  </div>
);

interface TimerSettingsProps {
  settings: TimerSettingsType;
  onUpdateSettings: (settings: TimerSettingsType) => void;
  onSave: () => void;
  onClose: () => void;
  buttonsDisabled: boolean;
  playSound: () => void;
}

export function TimerSettings({
  settings,
  onUpdateSettings,
  onSave,
  onClose,
  buttonsDisabled,
  playSound
}: TimerSettingsProps) {
  const [activeTab, setActiveTab] = useState<'timer' | 'longBreaks' | 'sound'>('timer');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Semi-transparent blurred backdrop */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white text-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Timer Settings</h3>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'timer' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('timer')}
          >
            Timer
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'longBreaks' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('longBreaks')}
          >
            Breaks
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'sound' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('sound')}
          >
            Sound
          </button>
        </div>
        
        {/* Content - with scrolling */}
        <div className="p-4 overflow-y-auto flex-grow">
          {activeTab === 'timer' ? (
            <div className="space-y-2">
              <NumberInput 
                value={settings.pomodoroDuration}
                onChange={(value) => onUpdateSettings({...settings, pomodoroDuration: value})}
                min={1}
                max={120}
                label="Pomodoro (minutes)"
              />
              
              <NumberInput 
                value={settings.breakDuration}
                onChange={(value) => onUpdateSettings({...settings, breakDuration: value})}
                min={1}
                max={60}
                label="Break (minutes)"
              />
            </div>
          ) : activeTab === 'longBreaks' ? (
            <div className="space-y-2">
              <ToggleSwitch 
                isChecked={settings.enableLongBreak || false}
                onChange={(checked) => onUpdateSettings({...settings, enableLongBreak: checked})}
                label="Enable Long Breaks"
              />
              
              {settings.enableLongBreak && (
                <>
                  <NumberInput 
                    value={settings.longBreakDuration || 15}
                    onChange={(value) => onUpdateSettings({...settings, longBreakDuration: value})}
                    min={1}
                    max={60}
                    label="Long Break (minutes)"
                  />
                  
                  <NumberInput 
                    value={settings.longBreakInterval || 4}
                    onChange={(value) => onUpdateSettings({...settings, longBreakInterval: value})}
                    min={2}
                    max={10}
                    label="Long Break Interval"
                  />
                  
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Long break after every {settings.longBreakInterval || 4} completed pomodoros
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-5 flex items-center justify-between">
                <label className="text-lg font-medium">Notification Sound</label>
                <select
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none w-40"
                  value={settings.notificationSound || notificationSounds[0].url}
                  onChange={e => onUpdateSettings({...settings, notificationSound: e.target.value})}
                >
                  {notificationSounds.map(sound => (
                    <option key={sound.url} value={sound.url}>{sound.name}</option>
                  ))}
                </select>
              </div>
              
              <ToggleSwitch 
                isChecked={settings.mute || false}
                onChange={(checked) => onUpdateSettings({...settings, mute: checked})}
                label="Mute Notifications"
              />
              
              <button
                className="mt-2 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                onClick={playSound}
                disabled={settings.mute || false}
              >
                Test Sound
              </button>
            </div>
          )}
        </div>
        
        {/* Save Button - fixed at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold shadow-md hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition hover:scale-105"
            onClick={onSave}
            disabled={buttonsDisabled}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}