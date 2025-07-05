/**
 * Productivity Panel Component
 * Pomodoro timer with focus modes, notes, and productivity tracking
 * Migrated from vanilla JavaScript while preserving all functionality
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Panel } from '@/components/ui';
import { usePanelSelection } from '@/hooks/usePanelInteractions';
import type { Position, Size } from '@/types/panel';

// Types for Productivity data structures
interface PomodoroSession {
  id: string;
  type: 'work' | 'break' | 'longBreak';
  duration: number; // in minutes
  completed: boolean;
  startTime: number;
  endTime?: number;
  date: string; // YYYY-MM-DD format
}

interface FocusTemplate {
  id: string;
  name: string;
  work: number;
  break: number;
  longBreak: number;
  sessions: number;
  description: string;
}

interface ProductivityNote {
  id: string;
  content: string;
  timestamp: number;
  sessionId?: string;
}

type FocusMode = 'work' | 'break' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';

export interface ProductivityProps {
  id: string;
  position: Position;
  size: Size;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
}

export const Productivity: React.FC<ProductivityProps> = ({
  id,
  position,
  size,
  onMove,
  onResize,
  className = '',
}) => {
  // Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [currentMode, setCurrentMode] = useState<FocusMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionCount, setSessionCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Settings state
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Notes state
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<ProductivityNote[]>([]);
  const [showNotes, setShowNotes] = useState(true);

  // History and statistics
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Panel selection state
  const { isSelected } = usePanelSelection(id);

  // Focus templates
  const focusTemplates: FocusTemplate[] = [
    {
      id: 'default',
      name: 'Classic Pomodoro',
      work: 25,
      break: 5,
      longBreak: 15,
      sessions: 4,
      description: 'Traditional 25/5 technique',
    },
    {
      id: 'extended',
      name: 'Extended Focus',
      work: 45,
      break: 15,
      longBreak: 30,
      sessions: 3,
      description: 'Longer work sessions for deep work',
    },
    {
      id: 'sprint',
      name: 'Sprint Mode',
      work: 15,
      break: 3,
      longBreak: 10,
      sessions: 6,
      description: 'Quick bursts for urgent tasks',
    },
    {
      id: 'flow',
      name: 'Flow State',
      work: 90,
      break: 20,
      longBreak: 45,
      sessions: 2,
      description: 'Long sessions for creative work',
    },
  ];

  // Load data on mount
  useEffect(() => {
    loadProductivityData();
    initializeAudio();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerStatus === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerStatus]);

  // Auto-save notes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentNote.trim()) {
        saveNote();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [currentNote]);

  // Auto-resize textarea
  useEffect(() => {
    if (notesTextareaRef.current) {
      notesTextareaRef.current.style.height = 'auto';
      notesTextareaRef.current.style.height = `${Math.min(notesTextareaRef.current.scrollHeight, 200)}px`;
    }
  }, [currentNote]);

  // Load productivity data from localStorage
  const loadProductivityData = useCallback(() => {
    try {
      const storedSessions = localStorage.getItem('lucaverse_pomodoro_sessions');
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }

      const storedNotes = localStorage.getItem('lucaverse_productivity_notes');
      if (storedNotes) {
        setSavedNotes(JSON.parse(storedNotes));
      }

      const storedSettings = localStorage.getItem('lucaverse_productivity_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setWorkDuration(settings.workDuration || 25);
        setBreakDuration(settings.breakDuration || 5);
        setLongBreakDuration(settings.longBreakDuration || 15);
        setSessionsUntilLongBreak(settings.sessionsUntilLongBreak || 4);
        setAutoStartBreaks(settings.autoStartBreaks || false);
        setSoundEnabled(settings.soundEnabled !== false);
        setSelectedTemplate(settings.selectedTemplate || 'default');
      }
    } catch (error) {
      console.error('Failed to load productivity data:', error);
    }
  }, []);

  // Save productivity data to localStorage
  const saveProductivityData = useCallback(() => {
    try {
      localStorage.setItem('lucaverse_pomodoro_sessions', JSON.stringify(sessions));
      localStorage.setItem('lucaverse_productivity_notes', JSON.stringify(savedNotes));

      const settings = {
        workDuration,
        breakDuration,
        longBreakDuration,
        sessionsUntilLongBreak,
        autoStartBreaks,
        soundEnabled,
        selectedTemplate,
      };
      localStorage.setItem('lucaverse_productivity_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save productivity data:', error);
    }
  }, [
    sessions,
    savedNotes,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    autoStartBreaks,
    soundEnabled,
    selectedTemplate,
  ]);

  // Initialize audio for notifications
  const initializeAudio = useCallback(async () => {
    // Create audio context for notification sounds
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioRef.current = new Audio();

      // Create a simple notification sound using Web Audio API
      const createNotificationSound = (frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      audioRef.current.play = () => {
        if (soundEnabled) {
          createNotificationSound(800, 0.5);
          setTimeout(() => createNotificationSound(600, 0.5), 200);
          setTimeout(() => createNotificationSound(800, 0.5), 400);
        }
      };
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }, [soundEnabled]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setTimerStatus('idle');

    // Play notification sound
    if (audioRef.current && soundEnabled) {
      audioRef.current.play();
    }

    // Complete current session
    if (currentSessionId) {
      const updatedSessions = sessions.map(session =>
        session.id === currentSessionId
          ? { ...session, completed: true, endTime: Date.now() }
          : session
      );
      setSessions(updatedSessions);
    }

    // Determine next mode
    if (currentMode === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      const nextMode = newSessionCount % sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
      setCurrentMode(nextMode);
      setTimeLeft((nextMode === 'longBreak' ? longBreakDuration : breakDuration) * 60);

      if (autoStartBreaks) {
        setTimeout(() => setTimerStatus('running'), 1000);
      }
    } else {
      setCurrentMode('work');
      setTimeLeft(workDuration * 60);
    }

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      const modeText = currentMode === 'work' ? 'Work session' : 'Break time';
      new Notification(`Lucaverse Productivity`, {
        body: `${modeText} completed! ${currentMode === 'work' ? 'Time for a break.' : 'Ready to focus?'}`,
        icon: '/icon.png',
      });
    }
  }, [
    currentMode,
    sessionCount,
    sessionsUntilLongBreak,
    autoStartBreaks,
    soundEnabled,
    workDuration,
    breakDuration,
    longBreakDuration,
    currentSessionId,
    sessions,
  ]);

  // Start timer
  const startTimer = useCallback(() => {
    setTimerStatus('running');

    // Create new session
    const sessionId = `session_${Date.now()}`;
    const newSession: PomodoroSession = {
      id: sessionId,
      type: currentMode,
      duration:
        currentMode === 'work'
          ? workDuration
          : currentMode === 'longBreak'
            ? longBreakDuration
            : breakDuration,
      completed: false,
      startTime: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(sessionId);
  }, [currentMode, workDuration, breakDuration, longBreakDuration]);

  // Pause/Resume timer
  const toggleTimer = useCallback(() => {
    setTimerStatus(prev => (prev === 'running' ? 'paused' : 'running'));
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerStatus('idle');
    setCurrentMode('work');
    setTimeLeft(workDuration * 60);
    setSessionCount(0);
    setCurrentSessionId(null);
  }, [workDuration]);

  // Apply template
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = focusTemplates.find(t => t.id === templateId);
      if (template) {
        setWorkDuration(template.work);
        setBreakDuration(template.break);
        setLongBreakDuration(template.longBreak);
        setSessionsUntilLongBreak(template.sessions);
        setSelectedTemplate(templateId);

        // Reset timer with new settings
        setTimerStatus('idle');
        setCurrentMode('work');
        setTimeLeft(template.work * 60);
        setSessionCount(0);
      }
    },
    [focusTemplates]
  );

  // Save note
  const saveNote = useCallback(() => {
    if (!currentNote.trim()) return;

    const newNote: ProductivityNote = {
      id: `note_${Date.now()}`,
      content: currentNote.trim(),
      timestamp: Date.now(),
      ...(currentSessionId && { sessionId: currentSessionId }),
    };

    setSavedNotes(prev => [newNote, ...prev.slice(0, 19)]); // Keep last 20 notes
  }, [currentNote, currentSessionId]);

  // Clear note
  const clearNote = useCallback(() => {
    setCurrentNote('');
  }, []);

  // Delete saved note
  const deleteSavedNote = useCallback((noteId: string) => {
    setSavedNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveProductivityData();
  }, [
    sessions,
    savedNotes,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    autoStartBreaks,
    soundEnabled,
    selectedTemplate,
  ]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get mode info
  const getModeInfo = useCallback((mode: FocusMode) => {
    const modeMap = {
      work: { text: '🔥 Focus Time', color: 'text-red-400 bg-red-500 bg-opacity-20' },
      break: { text: '☕ Break Time', color: 'text-green-400 bg-green-500 bg-opacity-20' },
      longBreak: { text: '🌟 Long Break', color: 'text-blue-400 bg-blue-500 bg-opacity-20' },
    };
    return modeMap[mode];
  }, []);

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(session => session.date === today && session.completed);

    const workSessions = todaySessions.filter(s => s.type === 'work').length;
    const totalMinutes = todaySessions.reduce((acc, session) => acc + session.duration, 0);
    const breakSessions = todaySessions.filter(s => s.type !== 'work').length;

    return { workSessions, totalMinutes, breakSessions };
  }, [sessions]);

  // Get progress percentage
  const progressPercentage = useMemo(() => {
    const totalDuration =
      currentMode === 'work'
        ? workDuration
        : currentMode === 'longBreak'
          ? longBreakDuration
          : breakDuration;
    return ((totalDuration * 60 - timeLeft) / (totalDuration * 60)) * 100;
  }, [currentMode, timeLeft, workDuration, breakDuration, longBreakDuration]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const currentTemplate = focusTemplates.find(t => t.id === selectedTemplate);
  const modeInfo = getModeInfo(currentMode);

  return (
    <Panel
      id={id}
      title="Productivity Station"
      icon="⏰"
      position={position}
      size={size}
      isSelected={isSelected}
      onMove={onMove || (() => {})}
      onResize={onResize || (() => {})}
      className={className}
      constraints={{
        minSize: { width: 400, height: 500 },
        maxSize: { width: 800, height: 900 },
      }}
    >
      <div className="h-full flex flex-col">
        {/* Timer Section */}
        <div className="p-6 border-b border-white border-opacity-10">
          {/* Template Selector */}
          <div className="mb-4">
            <select
              value={selectedTemplate}
              onChange={e => applyTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {focusTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          {/* Current Mode */}
          <div className="text-center mb-4">
            <div
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${modeInfo.color}`}
            >
              {modeInfo.text}
            </div>
            <div className="text-white text-opacity-60 text-xs mt-1">
              Session {sessionCount + 1} • {currentTemplate?.name}
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold text-white mb-2">
              {formatTime(timeLeft)}
            </div>

            {/* Progress Ring */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={
                    currentMode === 'work'
                      ? '#ef4444'
                      : currentMode === 'longBreak'
                        ? '#3b82f6'
                        : '#10b981'
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-opacity-60 text-sm">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-3">
            {timerStatus === 'idle' ? (
              <button
                onClick={startTimer}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Start {currentMode === 'work' ? 'Focus' : 'Break'}
              </button>
            ) : (
              <>
                <button
                  onClick={toggleTimer}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    timerStatus === 'running'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {timerStatus === 'running' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats and Notes */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Today's Statistics */}
            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Today's Progress
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-green-400">{todayStats.workSessions}</div>
                  <div className="text-xs text-white text-opacity-60">Sessions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">{todayStats.totalMinutes}</div>
                  <div className="text-xs text-white text-opacity-60">Minutes</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-400">
                    {todayStats.breakSessions}
                  </div>
                  <div className="text-xs text-white text-opacity-60">Breaks</div>
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <span className="mr-2">⚙️</span>
                Quick Settings
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-white text-opacity-80 text-sm">Auto-start breaks</span>
                  <input
                    type="checkbox"
                    checked={autoStartBreaks}
                    onChange={e => setAutoStartBreaks(e.target.checked)}
                    className="rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-white text-opacity-80 text-sm">Sound notifications</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-4">
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center">
                  <span className="mr-2">📝</span>
                  Focus Notes
                </h3>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-white text-opacity-60 hover:text-opacity-100 transition-colors"
                >
                  {showNotes ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {showNotes && (
                <div className="space-y-3">
                  {/* Current Note */}
                  <div>
                    <textarea
                      ref={notesTextareaRef}
                      value={currentNote}
                      onChange={e => setCurrentNote(e.target.value)}
                      placeholder="Jot down thoughts, ideas, or session notes..."
                      className="w-full px-3 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded text-white placeholder-white placeholder-opacity-60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between mt-2">
                      <div className="text-white text-opacity-40 text-xs">
                        Auto-saves while typing
                      </div>
                      {currentNote.trim() && (
                        <button
                          onClick={clearNote}
                          className="text-white text-opacity-60 hover:text-opacity-100 text-xs"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Saved Notes */}
                  {savedNotes.length > 0 && (
                    <div>
                      <div className="text-white text-opacity-80 text-sm font-medium mb-2">
                        Recent Notes
                      </div>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {savedNotes.slice(0, 5).map(note => (
                          <div
                            key={note.id}
                            className="p-2 bg-white bg-opacity-5 rounded text-sm group"
                          >
                            <div className="text-white text-opacity-90 mb-1">{note.content}</div>
                            <div className="flex justify-between items-center">
                              <div className="text-white text-opacity-40 text-xs">
                                {new Date(note.timestamp).toLocaleTimeString()}
                              </div>
                              <button
                                onClick={() => deleteSavedNote(note.id)}
                                className="text-white text-opacity-40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

Productivity.displayName = 'Productivity';

export default Productivity;
