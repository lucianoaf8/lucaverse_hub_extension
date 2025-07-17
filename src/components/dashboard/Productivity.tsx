import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Timer, Play, Pause, RotateCcw, VolumeX, Volume2 } from 'lucide-react';

const TIMER_CONFIGS = {
  pomodoro: { duration: 1500, label: 'Pomodoro' }, // 25 minutes
  short: { duration: 300, label: 'Short Break' },   // 5 minutes
  long: { duration: 900, label: 'Long Break' }      // 15 minutes
};

export default function Productivity() {
  const { themeConfig } = useTheme();
  const [sessionType, setSessionType] = useState('pomodoro');
  const [timer, setTimer] = useState(TIMER_CONFIGS.pomodoro.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    setTimer(TIMER_CONFIGS[sessionType].duration);
    setIsActive(false);
  }, [sessionType]);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setSessionCount(prev => prev + 1);
      setTotalMinutes(prev => prev + Math.floor(TIMER_CONFIGS[sessionType].duration / 60));
    }
    
    return () => clearInterval(interval);
  }, [isActive, timer, sessionType]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimer(TIMER_CONFIGS[sessionType].duration);
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const progress = ((TIMER_CONFIGS[sessionType].duration - timer) / TIMER_CONFIGS[sessionType].duration) * 100;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: themeConfig.colors.neutral[200] }}>
          <Timer size={16} style={{ color: themeConfig.colors.primary[400] }} /> 
          Focus Hub
          {sessionCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    color: themeConfig.colors.neutral[300],
                    backgroundColor: `${themeConfig.colors.neutral[700]}50` 
                  }}>
              {sessionCount}
            </span>
          )}
        </h2>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-grow flex gap-4">
        {/* Left Side - Timer and Controls */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                strokeWidth="6"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={`${themeConfig.colors.neutral[700]}30`}
              />
              <circle
                className="transition-all duration-1000"
                strokeWidth="6"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={themeConfig.colors.primary[500]}
                strokeDasharray="283"
                strokeDashoffset={283 - (progress / 100) * 283}
              />
            </svg>
            
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tighter" style={{ color: themeConfig.colors.neutral[100] }}>
                {formatTime(timer)}
              </div>
              <p className="text-sm capitalize" style={{ color: themeConfig.colors.neutral[400] }}>
                {TIMER_CONFIGS[sessionType].label}
              </p>
              {isActive && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: themeConfig.colors.success[400] }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeConfig.colors.success[400] }}></div>
                  Active
                </div>
              )}
            </div>
          </div>

          {/* Speaker Control */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="mb-3 p-2 rounded-lg transition-colors"
            style={{
              color: themeConfig.colors.neutral[500],
              backgroundColor: `${themeConfig.colors.neutral[800]}30`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = themeConfig.colors.neutral[100];
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = themeConfig.colors.neutral[500];
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}30`;
            }}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Controls */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
              style={{
                backgroundColor: isActive 
                  ? `${themeConfig.colors.warning[600]}20` 
                  : `${themeConfig.colors.success[600]}20`,
                color: isActive 
                  ? themeConfig.colors.warning[300] 
                  : themeConfig.colors.success[300],
                border: `1px solid ${isActive 
                  ? `${themeConfig.colors.warning[600]}30` 
                  : `${themeConfig.colors.success[600]}30`}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isActive 
                  ? `${themeConfig.colors.warning[600]}30` 
                  : `${themeConfig.colors.success[600]}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive 
                  ? `${themeConfig.colors.warning[600]}20` 
                  : `${themeConfig.colors.success[600]}20`;
              }}
            >
              {isActive ? <Pause size={12} /> : <Play size={12} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetTimer}
              className="flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
              style={{
                backgroundColor: `${themeConfig.colors.neutral[700]}50`,
                color: themeConfig.colors.neutral[300]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeConfig.colors.neutral[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* Session Stats */}
          <div className="flex gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold" style={{ color: themeConfig.colors.neutral[100] }}>{sessionCount}</span>
              <span className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>Sessions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold" style={{ color: themeConfig.colors.neutral[100] }}>{totalMinutes}</span>
              <span className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>Minutes</span>
            </div>
          </div>
        </div>

        {/* Right Side - Session Type Selector */}
        <div className="w-24 flex flex-col gap-2">
          <h4 className="text-xs font-semibold mb-1" style={{ color: themeConfig.colors.neutral[400] }}>Session Type</h4>
          {Object.entries(TIMER_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSessionType(key)}
              className="py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center border"
              style={{
                backgroundColor: sessionType === key
                  ? `${themeConfig.colors.primary[600]}20`
                  : `${themeConfig.colors.neutral[700]}50`,
                color: sessionType === key
                  ? themeConfig.colors.primary[300]
                  : themeConfig.colors.neutral[300],
                borderColor: sessionType === key
                  ? `${themeConfig.colors.primary[500]}30`
                  : `${themeConfig.colors.neutral[600]}30`
              }}
              onMouseEnter={(e) => {
                if (sessionType !== key) {
                  e.currentTarget.style.backgroundColor = themeConfig.colors.neutral[700];
                }
              }}
              onMouseLeave={(e) => {
                if (sessionType !== key) {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
                }
              }}
            >
              <div>{config.label}</div>
              <div className="text-xs opacity-75 mt-0.5">
                {Math.floor(config.duration / 60)}m
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}