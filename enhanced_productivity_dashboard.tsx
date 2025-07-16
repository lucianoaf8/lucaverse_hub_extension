import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Bell, User, Plus, MoreHorizontal, CheckCircle, Circle, ArrowRight, Rss, Github, Twitter, Dribbble, Bot, BrainCircuit, Timer, Zap, Target, Maximize, Minimize, Book, History, Edit, CloudSun, Volume2, VolumeX, ListTodo, Save, Settings, Moon, Sun, Command, Trash2, GripVertical, Play, Pause, RotateCcw, Activity, Calendar, Clock } from 'lucide-react';

// Enhanced mock data with more realistic content
const quickTags = [
  { icon: <Github size={16} />, name: 'GitHub', url: 'https://github.com' },
  { icon: <Twitter size={16} />, name: 'Twitter', url: 'https://twitter.com' },
  { icon: <Dribbble size={16} />, name: 'Dribbble', url: 'https://dribbble.com' },
  { icon: <Rss size={16} />, name: 'Blog', url: '#' },
];

const initialTasks = [
  {
    id: 1,
    text: 'Finalize Q3 marketing strategy',
    completed: false,
    priority: 'High',
    dueDate: '2025-07-20',
    subtasks: [
      { id: '1a', text: 'Gather market research data', completed: true },
      { id: '1b', text: 'Draft presentation slides', completed: false },
      { id: '1c', text: 'Review with team lead', completed: false },
    ]
  },
  { id: 2, text: 'Develop AR prototype', completed: false, priority: 'High', dueDate: '2025-07-25', subtasks: [] },
  { id: 3, text: 'Onboard design team', completed: true, priority: 'Medium', dueDate: '2025-07-15', subtasks: [] },
  { id: 4, text: 'Review budget submissions', completed: false, priority: 'Low', dueDate: '2025-07-30', subtasks: [] },
  { id: 5, text: 'Plan September offsite', completed: true, priority: 'Medium', dueDate: '2025-08-01', subtasks: [] },
];

const recentBookmarks = [
  { id: 1, text: 'React Performance Guide', url: '#' },
  { id: 2, text: 'Figma Prototyping', url: '#' },
  { id: 3, text: 'TypeScript Guide', url: '#' },
  { id: 4, text: 'Next.js Documentation', url: '#' },
  { id: 5, text: 'Tailwind CSS Docs', url: '#' },
];

const recentlyClosed = [
  { id: 1, text: 'Linear - Project Planning', url: '#' },
  { id: 2, text: 'Slack Team Chat', url: '#' },
  { id: 3, text: 'Notion Meeting Notes', url: '#' },
  { id: 4, text: 'Gmail Dashboard', url: '#' },
  { id: 5, text: 'Figma Design File', url: '#' },
];

const motivationalQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];

const noteTemplates = [
  { name: 'Standup', icon: '🎯', content: `## Daily Standup - ${new Date().toLocaleDateString()}\n\n**Yesterday:**\n- \n\n**Today:**\n- \n\n**Blockers:**\n- ` },
  { name: 'Meeting', icon: '📝', content: `## Meeting Notes\n\n**Attendees:**\n- \n\n**Topics:**\n- \n\n**Actions:**\n- [ ] ` },
  { name: 'Ideas', icon: '💡', content: `## Brainstorm\n\n**Problem:**\n- \n\n**Ideas:**\n- \n\n**Next Steps:**\n- ` }
];

// Timer configurations
const TIMER_CONFIGS = {
  pomodoro: { duration: 25 * 60, label: 'Pomodoro' },
  shortBreak: { duration: 5 * 60, label: 'Break' },
  deepWork: { duration: 90 * 60, label: 'Deep Work' },
  custom: { duration: 30 * 60, label: 'Custom' }
};

// Unified GlowCard component
const GlowCard = ({ children, className = '', panelId, onToggleFocus, isFocused = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-slate-600/80 h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-700/20 to-slate-800/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`}></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {onToggleFocus && (
        <button 
          onClick={() => onToggleFocus(panelId)} 
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors z-20 p-1 rounded-lg hover:bg-slate-700/50"
          title={isFocused ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {isFocused ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      )}
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

// Enhanced Header with all elements restored
const Header = ({ time, isDarkMode, toggleDarkMode }) => {
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const mockWeather = {
    temperature: 22,
    condition: 'Partly Cloudy',
    location: 'San Francisco',
    icon: <CloudSun size={18} className="text-yellow-400" />
  };

  return (
    <header className="flex items-center justify-between p-4 text-white h-24 flex-shrink-0">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit className="text-indigo-400" size={32} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lucaxnet v4.0
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enhanced Productivity Suite</p>
          </div>
        </div>
        {quote.text && (
          <p className="text-sm text-slate-400 italic ml-10 max-w-lg">
            "{quote.text}" <span className="text-slate-500">— {quote.author}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'w-96' : 'w-80'}`}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search everything... (Ctrl+K)"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-full py-2.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
            Ctrl+K
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800/40 rounded-full px-4 py-2 border border-slate-700/50">
          {mockWeather.icon}
          <div className="text-sm">
            <div className="font-semibold">{mockWeather.temperature}°C</div>
            <div className="text-slate-400 text-xs">{mockWeather.condition}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></div>
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

// Quick Access Card
const QuickAccessCard = (props) => (
  <GlowCard className="p-4" {...props}>
    <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
      <Zap size={16} className="text-indigo-400" /> 
      Quick Access
    </h2>
    
    <div className="space-y-4">
      {/* Quick Tags */}
      <div>
        <h3 className="font-semibold text-slate-400 text-xs mb-2">Quick Links</h3>
        <div className="grid grid-cols-4 gap-2">
          {quickTags.map((link, index) => (
            <a 
              key={index} 
              href={link.url} 
              className="group flex flex-col items-center justify-center gap-1 p-2 bg-slate-900/50 hover:bg-slate-800/70 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                {link.icon}
              </div>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                {link.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-2 gap-3">
        {/* Recently Closed */}
        <div>
          <h3 className="font-semibold text-slate-400 text-xs mb-2 flex items-center gap-1">
            <History size={10} />
            Recently Closed
          </h3>
          <div className="space-y-1">
            {recentlyClosed.slice(0, 5).map(item => (
              <a 
                key={item.id} 
                href={item.url} 
                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/50 transition-colors text-xs group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></div>
                <span className="text-slate-300 group-hover:text-white transition-colors truncate">
                  {item.text}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bookmarks */}
        <div>
          <h3 className="font-semibold text-slate-400 text-xs mb-2 flex items-center gap-1">
            <Book size={10} />
            Bookmarks
          </h3>
          <div className="space-y-1">
            {recentBookmarks.slice(0, 5).map(item => (
              <a 
                key={item.id} 
                href={item.url} 
                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/50 transition-colors text-xs group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span className="text-slate-300 group-hover:text-white transition-colors truncate">
                  {item.text}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </GlowCard>
);

// Mission Control Card
const MissionControlCard = (props) => {
  const [taskList, setTaskList] = useState(initialTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const toggleTask = (id) => {
    setTaskList(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTaskText.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    
    setTaskList(prev => [...prev, newTask]);
    setNewTaskText('');
    setShowAddTask(false);
  };

  const completedTasks = taskList.filter(t => t.completed).length;
  const totalTasks = taskList.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <GlowCard className="p-4 flex flex-col" {...props}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Target size={16} className="text-cyan-400" /> 
          Mission Control
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
            {taskList.filter(t => !t.completed).length}
          </span>
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 text-xs font-semibold py-1.5 px-3 rounded-md transition-all border border-cyan-500/50"
          >
            <Plus size={12} /> Add Task
          </button>
          
          <button className="flex items-center gap-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-1.5 px-3 rounded-md transition-all border border-slate-600/50">
            <ListTodo size={12} /> Reminders
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{completedTasks}/{totalTasks} ({progress.toFixed(0)}%)</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="mb-3 p-2 bg-slate-900/50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="New task..."
              className="flex-grow bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <button
              onClick={addTask}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded text-xs"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2 overflow-y-auto flex-grow custom-scrollbar">
        {taskList.slice(0, 10).map(task => (
          <div 
            key={task.id} 
            className={`group p-2 rounded-lg transition-all duration-300 border ${
              task.completed 
                ? 'bg-slate-800/30 border-slate-700/30 text-slate-500' 
                : 'bg-slate-900/50 hover:bg-slate-800/70 border-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                {task.completed ? 
                  <CheckCircle size={16} className="text-green-500" /> : 
                  <Circle size={16} className="text-slate-600 hover:text-slate-400" />
                }
              </button>
              
              <div className="flex-grow min-w-0">
                <span className={`block text-sm ${task.completed ? 'line-through' : 'text-slate-200'} truncate`}>
                  {task.text}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                task.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {task.priority}
              </span>
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="ml-6 mt-2 space-y-1">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 text-xs">
                    {subtask.completed ? 
                      <CheckCircle size={12} className="text-green-600" /> : 
                      <Circle size={12} className="text-slate-700" />
                    }
                    <span className={`${subtask.completed ? 'line-through text-slate-600' : 'text-slate-400'}`}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {taskList.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Target size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>
    </GlowCard>
  );
};

// Focus Hub Card
const FocusHubCard = (props) => {
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
  }, [isActive, timer]);

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
    <GlowCard className="p-4 flex flex-col" {...props}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Timer size={16} className="text-purple-400" /> 
          Focus Hub
          {sessionCount > 0 && (
            <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
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
                className="text-slate-700/30"
                strokeWidth="6"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
              />
              <circle
                className="text-purple-500 transition-all duration-1000"
                strokeWidth="6"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeDasharray="283"
                strokeDashoffset={283 - (progress / 100) * 283}
              />
            </svg>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white tracking-tighter">
                {formatTime(timer)}
              </div>
              <p className="text-sm text-slate-400 capitalize">
                {TIMER_CONFIGS[sessionType].label}
              </p>
              {isActive && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  Active
                </div>
              )}
            </div>
          </div>

          {/* Speaker Control */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="mb-3 p-2 rounded-lg text-slate-500 hover:text-white transition-colors bg-slate-800/30 hover:bg-slate-700/50"
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Controls */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-orange-600/20 text-orange-300 hover:bg-orange-600/30' 
                  : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
              }`}
            >
              {isActive ? <Pause size={12} /> : <Play size={12} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetTimer}
              className="flex items-center gap-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* Session Stats */}
          <div className="flex gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{sessionCount}</span>
              <span className="text-xs text-slate-400">Sessions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{totalMinutes}</span>
              <span className="text-xs text-slate-400">Minutes</span>
            </div>
          </div>
        </div>

        {/* Right Side - Session Type Selector */}
        <div className="w-24 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-slate-400 mb-1">Session Type</h4>
          {Object.entries(TIMER_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSessionType(key)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
                sessionType === key
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/30'
              }`}
            >
              <div>{config.label}</div>
              <div className="text-xs opacity-75 mt-0.5">
                {Math.floor(config.duration / 60)}m
              </div>
            </button>
          ))}
        </div>
      </div>
    </GlowCard>
  );
};

// Notes Card
const NotesCard = (props) => {
  const [noteContent, setNoteContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [historicalNotes, setHistoricalNotes] = useState([]);

  const handleTemplateClick = (template) => {
    setNoteContent(template.content);
    setSelectedTemplate(template);
  };

  const handleSaveNote = () => {
    if (noteContent.trim() === '') return;

    const newNote = {
      id: Date.now(),
      title: noteContent.split('\n')[0].replace(/^#+\s*/, '') || `Note ${new Date().toLocaleTimeString()}`,
      content: noteContent,
      date: new Date().toISOString(),
    };

    setHistoricalNotes(prev => [newNote, ...prev.slice(0, 4)]);
    setNoteContent('');
    setSelectedTemplate(null);
  };

  return (
    <GlowCard className="p-4 flex flex-col" {...props}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Edit size={16} className="text-emerald-400" /> 
          Smart Notes
        </h2>
      </div>

      {/* Template Selector and Save Button */}
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="flex gap-1">
          {noteTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateClick(template)}
              className={`flex items-center gap-1 text-xs rounded px-2 py-1 transition-all ${
                selectedTemplate?.name === template.name
                  ? 'bg-emerald-600/20 text-emerald-300'
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span className="text-xs">{template.icon}</span>
              {template.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleSaveNote}
          disabled={noteContent.trim() === ''}
          className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:bg-slate-700/30 text-emerald-300 disabled:text-slate-500 text-xs font-semibold py-1 px-3 rounded-lg transition-all border border-emerald-500/30 disabled:border-slate-600/30"
        >
          <Save size={12} /> Save
        </button>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-grow flex gap-4 min-h-0">
        {/* Left Side - Note Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="Start writing your thoughts..."
            className="w-full bg-slate-900/70 border border-slate-700/50 rounded-lg p-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none custom-scrollbar text-sm flex-grow"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>

        {/* Right Side - Historical Notes */}
        <div className="w-32 flex flex-col">
          <h3 className="font-semibold text-slate-400 text-xs mb-2">Recent</h3>
          {historicalNotes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              <div className="text-center">
                <Edit size={16} className="mx-auto mb-1 opacity-50" />
                <p className="text-xs">No notes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
              {historicalNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setNoteContent(note.content)}
                  className="p-2 bg-slate-900/50 hover:bg-slate-800/70 rounded cursor-pointer group border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  <p className="text-slate-400 text-xs mb-1">
                    {new Date(note.date).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlowCard>
  );
};

// Compact Footer
const Footer = () => (
  <footer className="flex items-center justify-between p-2 text-slate-400 h-12 flex-shrink-0 border-t border-slate-700/50">
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-2">
        <Activity size={12} className="text-emerald-400" />
        <span>System Status: Optimal</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={12} className="text-blue-400" />
        <span>Uptime: 2h 34m</span>
      </div>
    </div>
    
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <span>Shortcuts:</span>
        <kbd className="bg-slate-700/50 px-1 rounded">Ctrl+K</kbd>
        <kbd className="bg-slate-700/50 px-1 rounded">Ctrl+M</kbd>
        <kbd className="bg-slate-700/50 px-1 rounded">Ctrl+F</kbd>
        <kbd className="bg-slate-700/50 px-1 rounded">Ctrl+N</kbd>
      </div>
      <span>v4.0.1</span>
    </div>
  </footer>
);

// Main App Component
export default function App() {
  const [time, setTime] = useState(new Date());
  const [focusedPanel, setFocusedPanel] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            break;
          case 'q':
            e.preventDefault();
            setFocusedPanel(prev => prev === 'quickAccess' ? null : 'quickAccess');
            break;
          case 'm':
            e.preventDefault();
            setFocusedPanel(prev => prev === 'missionControl' ? null : 'missionControl');
            break;
          case 'f':
            e.preventDefault();
            setFocusedPanel(prev => prev === 'focusHub' ? null : 'focusHub');
            break;
          case 'n':
            e.preventDefault();
            setFocusedPanel(prev => prev === 'notes' ? null : 'notes');
            break;
        }
      }
      
      if (e.key === 'Escape' && focusedPanel) {
        setFocusedPanel(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusedPanel]);

  const handleToggleFocus = (panelId) => {
    setFocusedPanel(prev => (prev === panelId ? null : panelId));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const panels = {
    quickAccess: <QuickAccessCard onToggleFocus={handleToggleFocus} panelId="quickAccess" isFocused={focusedPanel === 'quickAccess'} />,
    missionControl: <MissionControlCard onToggleFocus={handleToggleFocus} panelId="missionControl" isFocused={focusedPanel === 'missionControl'} />,
    focusHub: <FocusHubCard onToggleFocus={handleToggleFocus} panelId="focusHub" isFocused={focusedPanel === 'focusHub'} />,
    notes: <NotesCard onToggleFocus={handleToggleFocus} panelId="notes" isFocused={focusedPanel === 'notes'} />,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { 
          font-family: 'Inter', sans-serif; 
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(45, 55, 72, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-slate-700/10 via-slate-800/5 to-slate-900/10"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-slate-800/10 via-slate-900/5 to-slate-700/10"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <Header time={time} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        {/* Main Dashboard Grid - 2x2 Equal Quadrants */}
        <main className={`flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 pt-0 transition-all duration-500 min-h-0 ${
          focusedPanel ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
        }`}>
          {/* Top Left - Quick Access */}
          <div className="col-span-1 row-span-1">
            <QuickAccessCard onToggleFocus={handleToggleFocus} panelId="quickAccess" />
          </div>
          
          {/* Top Right - Mission Control */}
          <div className="col-span-1 row-span-1">
            <MissionControlCard onToggleFocus={handleToggleFocus} panelId="missionControl" />
          </div>
          
          {/* Bottom Left - Focus Hub */}
          <div className="col-span-1 row-span-1">
            <FocusHubCard onToggleFocus={handleToggleFocus} panelId="focusHub" />
          </div>
          
          {/* Bottom Right - Notes */}
          <div className="col-span-1 row-span-1">
            <NotesCard onToggleFocus={handleToggleFocus} panelId="notes" />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      {/* Focused Panel Overlay */}
      {focusedPanel && (
        <div className="fixed inset-0 z-40 p-6 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full h-full max-w-4xl max-h-4xl">
            {panels[focusedPanel]}
          </div>
        </div>
      )}
    </div>
  );
}