import React, { useState, useEffect, useCallback } from 'react';

interface PomodoroSession {
  id: string;
  type: 'work' | 'break';
  duration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

interface ProductivityMetrics {
  todayFocusTime: number;
  completedSessions: number;
  currentStreak: number;
  totalSessions: number;
}

export default function Productivity() {
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [customDuration, setCustomDuration] = useState(25);
  
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    todayFocusTime: 145, // minutes
    completedSessions: 8,
    currentStreak: 3,
    totalSessions: 47,
  });

  const [sessions] = useState<PomodoroSession[]>([
    {
      id: '1',
      type: 'work',
      duration: 25,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      completed: true,
    },
    {
      id: '2',
      type: 'break',
      duration: 5,
      startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1.25 * 60 * 60 * 1000),
      completed: true,
    },
    {
      id: '3',
      type: 'work',
      duration: 25,
      startTime: new Date(Date.now() - 1.25 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 60 * 60 * 1000),
      completed: true,
    },
  ]);

  const presetDurations = [
    { label: 'Pomodoro', work: 25, break: 5 },
    { label: 'Short Focus', work: 15, break: 3 },
    { label: 'Long Focus', work: 45, break: 10 },
    { label: 'Custom', work: customDuration, break: Math.ceil(customDuration / 5) },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, handleSessionComplete]);

  const startSession = useCallback((type: 'work' | 'break', duration: number) => {
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type,
      duration,
      startTime: new Date(),
      completed: false,
    };

    setActiveSession(session);
    setTimeRemaining(duration * 60);
    setIsRunning(true);
    setSessionType(type);
  }, []);

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    setIsRunning(true);
  };

  const stopSession = () => {
    setIsRunning(false);
    setActiveSession(null);
    setTimeRemaining(0);
  };

  const handleSessionComplete = useCallback(() => {
    if (activeSession) {
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        todayFocusTime: prev.todayFocusTime + (sessionType === 'work' ? activeSession.duration : 0),
        currentStreak: prev.currentStreak + 1,
        totalSessions: prev.totalSessions + 1,
      }));

      // Auto-start break after work session
      if (sessionType === 'work') {
        setTimeout(() => {
          startSession('break', 5);
        }, 1000);
      }
    }
    setActiveSession(null);
  }, [activeSession, sessionType, startSession]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionTypeColor = (type: 'work' | 'break') => {
    return type === 'work' ? 'text-primary' : 'text-secondary';
  };

  const getSessionTypeIcon = (type: 'work' | 'break') => {
    return type === 'work' ? '🎯' : '☕';
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-lg border border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700 bg-elevated rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <span className="text-success">⚡</span>
            </div>
            <div>
              <h3 className="font-medium text-success">Productivity Tools</h3>
              <p className="text-xs text-neutral-400">
                Focus timer and productivity tracking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="p-4 border-b border-neutral-700">
        <div className="text-center mb-4">
          <div className={`text-6xl font-mono font-bold mb-2 ${
            activeSession ? getSessionTypeColor(sessionType) : 'text-neutral-400'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400">
            {activeSession && (
              <>
                <span className="text-2xl">{getSessionTypeIcon(sessionType)}</span>
                <span className={getSessionTypeColor(sessionType)}>
                  {sessionType === 'work' ? 'Focus Session' : 'Break Time'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-4">
          {!activeSession ? (
            <div className="grid grid-cols-2 gap-2">
              {presetDurations.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => startSession('work', preset.work)}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded text-sm transition-colors"
                >
                  {preset.label}
                  <div className="text-xs opacity-80">{preset.work}min</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={isRunning ? pauseSession : resumeSession}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded text-sm transition-colors"
              >
                {isRunning ? '⏸️ Pause' : '▶️ Resume'}
              </button>
              <button
                onClick={stopSession}
                className="px-4 py-2 bg-danger hover:bg-danger/80 text-white rounded text-sm transition-colors"
              >
                🛑 Stop
              </button>
            </div>
          )}
        </div>

        {presetDurations.some(p => p.label === 'Custom') && (
          <div className="flex items-center justify-center space-x-2 text-sm">
            <label className="text-neutral-400">Custom duration:</label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-center"
              min="1"
              max="120"
            />
            <span className="text-neutral-400">minutes</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="p-4 border-b border-neutral-700">
        <h4 className="font-medium text-neutral-300 mb-3">Today&apos;s Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-elevated rounded-lg border border-neutral-700">
            <div className="text-lg font-bold text-primary">{metrics.todayFocusTime}</div>
            <div className="text-xs text-neutral-400">Focus Minutes</div>
          </div>
          <div className="text-center p-3 bg-elevated rounded-lg border border-neutral-700">
            <div className="text-lg font-bold text-success">{metrics.completedSessions}</div>
            <div className="text-xs text-neutral-400">Completed Sessions</div>
          </div>
          <div className="text-center p-3 bg-elevated rounded-lg border border-neutral-700">
            <div className="text-lg font-bold text-warning">{metrics.currentStreak}</div>
            <div className="text-xs text-neutral-400">Current Streak</div>
          </div>
          <div className="text-center p-3 bg-elevated rounded-lg border border-neutral-700">
            <div className="text-lg font-bold text-secondary">{metrics.totalSessions}</div>
            <div className="text-xs text-neutral-400">Total Sessions</div>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="p-4 border-b border-neutral-700">
        <h4 className="font-medium text-neutral-300 mb-3">Quick Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 bg-elevated hover:bg-neutral-700 rounded border border-neutral-700 text-sm transition-colors">
            <span className="block text-lg mb-1">📊</span>
            <span>Progress Report</span>
          </button>
          <button className="p-2 bg-elevated hover:bg-neutral-700 rounded border border-neutral-700 text-sm transition-colors">
            <span className="block text-lg mb-1">🎯</span>
            <span>Set Goals</span>
          </button>
          <button className="p-2 bg-elevated hover:bg-neutral-700 rounded border border-neutral-700 text-sm transition-colors">
            <span className="block text-lg mb-1">📅</span>
            <span>Schedule</span>
          </button>
          <button className="p-2 bg-elevated hover:bg-neutral-700 rounded border border-neutral-700 text-sm transition-colors">
            <span className="block text-lg mb-1">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="font-medium text-neutral-300 mb-3">Recent Sessions</h4>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-2 bg-elevated rounded border border-neutral-700"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getSessionTypeIcon(session.type)}</span>
                <div>
                  <div className={`text-sm font-medium ${getSessionTypeColor(session.type)}`}>
                    {session.type === 'work' ? 'Focus' : 'Break'} ({session.duration}min)
                  </div>
                  <div className="text-xs text-neutral-500">
                    {session.startTime.toLocaleTimeString()} - {session.endTime?.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-success">
                {session.completed ? '✅' : '⏳'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}