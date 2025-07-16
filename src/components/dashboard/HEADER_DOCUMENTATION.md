# Header Component Documentation

## Overview
The Header component is a comprehensive navigation and information bar that serves as the primary interface for the Lucaverse Hub dashboard. It combines branding, search functionality, user status, and interactive elements in a cohesive design.

## Component Structure

### File Location
`/src/components/dashboard/Header.tsx`

### Dependencies
- React hooks: `useState`, `useEffect`
- Lucide React icons: `Search`, `Bell`, `User`, `CloudSun`, `Sun`, `Moon`, `BrainCircuit`, `Settings`, `X`
- Theme context: `useTheme` from `../../contexts/ThemeContext`

## Layout Architecture

The header uses a **flexbox layout** with three main sections:

### 1. Left Section (`flex items-center gap-4 min-w-0`)
- **Logo & Status**: BrainCircuit icon with animated status indicator
- **Brand Name**: "Lucaverse Hub" with gradient text
- **Search Bar**: Full-text search with keyboard shortcut support

### 2. Center Section (`absolute left-1/2 transform -translate-x-1/2`)
- **Motivational Quote**: Randomly selected inspirational quote
- **Author Attribution**: Quote author with proper spacing

### 3. Right Section (`flex items-center gap-6`)
- **Mood Emoji Selector**: Interactive emoji picker
- **Date/Time Display**: Real-time clock with hover effects
- **Weather Widget**: Temperature and conditions display
- **Action Buttons**: Theme toggle, notifications, account menu

## Visual Elements & Effects

### Theme Integration
All colors and styles use the centralized theme system (`themeConfig`):
- **Primary Colors**: Purple palette (`#a855f7` main, `#c084fc` accent)
- **Secondary Colors**: Cyan palette (`#22d3ee`, `#06b6d4`)
- **Neutral Colors**: Gray scale for text and backgrounds
- **Glassmorphic Effects**: Backdrop blur with opacity variations

### Interactive States
- **Hover Effects**: Dynamic color transitions using `onMouseEnter`/`onMouseLeave`
- **Click Outside Detection**: Automatic dropdown closure
- **Transition Animations**: Smooth state changes with CSS transitions

### Typography
- **Font Family**: Inter with advanced font features
- **Size Hierarchy**: 
  - Clock: 1.2rem (custom)
  - Quote: text-sm (0.875rem)
  - Author: text-xs (0.75rem)
  - Weather: text-lg (1.125rem)

## Component Features

### 1. Logo & Branding
```tsx
<BrainCircuit style={{ color: themeConfig.colors.primary[400] }} size={32} />
<div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" 
     style={{ backgroundColor: themeConfig.colors.success[400] }} />
```
- **Icon**: BrainCircuit (32px) in primary purple
- **Status Indicator**: Animated pulse dot in success green
- **Brand Text**: Gradient from primary to secondary colors

### 2. Search Functionality
```tsx
<input
  type="text"
  placeholder="Search everything... (Ctrl+K)"
  className="w-full rounded-full py-1.5 pl-12 pr-4 focus:outline-none transition-all"
  style={{
    backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.medium || '80'}`,
    border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
    // ...
  }}
/>
```
- **Styling**: Glassmorphic design with purple border
- **Keyboard Shortcut**: Ctrl+K support (placeholder indication)
- **Icon**: Search icon with neutral color
- **Width**: Fixed 320px (w-80)

### 3. Motivational Quotes System
```tsx
const motivationalQuotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  // ... more quotes
];
```
- **Quote Pool**: 5 predefined motivational quotes
- **Selection**: Random quote on component mount
- **Persistence**: Quote doesn't change on re-renders
- **Layout**: Quote on first line, author below with negative margin
- **Spacing**: Custom spacing with `-mt-3` for tight author positioning

### 4. Mood Emoji Selector
```tsx
const moodEmojis = ['🤔', '😐', '😊', '😎', '🥱', '😴', '😤', '🙄', '😌', '🤗', '😑', '🔥', '💀', '👻', '🤖', '⚡', '🌟', '💎', '🎯', '🚀', '⭐', '✨'];
```
- **Emoji Grid**: 6x4 grid layout (22 total emojis)
- **Modal Design**: Glassmorphic dropdown with arrow pointer
- **Default Selection**: 🤔 (thinking face)
- **Size**: 2rem display, 1.5rem in selector
- **Spacing**: 3rem margin on sides

### 5. Real-Time Clock
```tsx
const formatDateTime = (date: Date) => ({
  time: date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: isClockHovered ? '2-digit' : undefined,
    hour12: true 
  }),
  date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
});
```
- **Format**: 12-hour format with AM/PM
- **Hover Feature**: Shows seconds when hovered
- **Gradient**: Purple to cyan gradient text
- **Update Frequency**: Every 1000ms
- **Font Weight**: Regular (not bold)

### 6. Weather Display
```tsx
<div className="flex flex-col items-center rounded-lg px-4 py-1.5">
  <div className="flex items-center gap-2">
    <CloudSun size={24} style={{ color: themeConfig.colors.warning[400] }} />
    <span className="font-semibold text-lg">22°C</span>
  </div>
  <div className="text-xs mt-0.5">Partly Cloudy</div>
</div>
```
- **Layout**: Icon and temperature on same line, description below
- **Icon**: CloudSun (24px) in warning yellow
- **Temperature**: Bold, large text in neutral[100]
- **Description**: Small text in neutral[400]

### 7. Notifications System
```tsx
const mockNotifications = [
  { id: 1, title: 'New task assigned', message: '...', time: '5 min ago', read: false },
  // ... more notifications
];
```
- **Modal Design**: 320px width, glassmorphic styling
- **Notification Badge**: Red dot indicator on bell icon
- **Status Indicators**: Blue dot (unread) vs gray dot (read)
- **Scrollable**: Max height with overflow handling
- **Mock Data**: 4 sample notifications with realistic content

### 8. Account Menu
- **User Avatar**: Gradient circle with "U" initial
- **Menu Items**: Account (with user icon) and Settings (with gear icon)
- **Styling**: Consistent with notification modal design
- **Width**: 192px (w-48)

## State Management

### Component State
```tsx
const [currentDateTime, setCurrentDateTime] = useState(new Date());
const [searchQuery, setSearchQuery] = useState('');
const [quote, setQuote] = useState(motivationalQuotes[0]);
const [selectedMoodEmoji, setSelectedMoodEmoji] = useState('🤔');
const [showEmojiSelector, setShowEmojiSelector] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [showAccountMenu, setShowAccountMenu] = useState(false);
const [isClockHovered, setIsClockHovered] = useState(false);
```

### Event Handlers
- **Click Outside**: Automatic dropdown closure for all modals
- **Hover States**: Dynamic styling for interactive elements
- **Timer Management**: Clock updates with cleanup
- **Quote Initialization**: Single random selection on mount

## Styling System

### CSS Classes
- **Responsive Design**: Flex layouts with gap spacing
- **Transitions**: `transition-all`, `transition-colors` for smooth animations
- **Typography**: Inter font with font feature settings
- **Backdrop Effects**: `backdrop-blur-xl` for glassmorphic design

### Inline Styles
All colors and dynamic styles use theme configuration:
```tsx
style={{
  backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.medium || '80'}`,
  border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
  color: themeConfig.colors.neutral[100],
}}
```

### Hover Interactions
```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.color = themeConfig.colors.neutral[100];
  e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
}}
onMouseLeave={(e) => {
  e.currentTarget.style.color = themeConfig.colors.neutral[400];
  e.currentTarget.style.backgroundColor = 'transparent';
}}
```

## Accessibility Features

### Keyboard Support
- **Search Focus**: Ctrl+K placeholder indication
- **Tab Navigation**: All interactive elements are focusable
- **Escape Key**: Closes modals (handled by click-outside detection)

### ARIA Labels
- **Icon Buttons**: Title attributes for screen readers
- **Status Indicators**: Semantic meaning through color and animation

### Visual Feedback
- **Hover States**: Clear indication of interactive elements
- **Focus Styles**: Outline and border changes
- **Loading States**: Animated pulse for status indicator

## Performance Considerations

### Optimization Strategies
- **Timer Cleanup**: Proper useEffect cleanup for clock updates
- **Memoization**: Theme config memoized in context
- **Event Delegation**: Efficient click-outside detection
- **Conditional Rendering**: Dropdowns only render when visible

### Bundle Impact
- **Icons**: Tree-shaken Lucide React imports
- **Dependencies**: Minimal external dependencies
- **CSS**: Tailwind classes with custom CSS variables

## Integration Points

### Theme Context
```tsx
const { themeConfig } = useTheme();
```
- **Color System**: All colors from centralized theme
- **Opacity Values**: Glass and border opacity from theme
- **Gradient Definitions**: Background gradients from theme config

### Parent Props
```tsx
interface HeaderProps {
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}
```

### Event Callbacks
- **Search Handler**: Optional search query callback
- **Theme Toggle**: Optional dark mode toggle function

## Maintenance Notes

### Future Enhancements
- **Real Weather API**: Replace mock weather data
- **Search Integration**: Connect to actual search functionality
- **Notification API**: Replace mock notifications with real data
- **User Profile**: Dynamic user avatar and information

### Design Consistency
- **Color Palette**: Maintain purple/cyan theme throughout
- **Spacing System**: Use consistent gap and padding values
- **Typography Scale**: Maintain established font size hierarchy
- **Animation Timing**: Keep consistent transition durations

### Code Quality
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Graceful degradation for missing props
- **Performance**: Optimized re-renders and event handling
- **Accessibility**: WCAG compliance for all interactive elements

## Testing Considerations

### Unit Tests
- **State Management**: Quote randomization, dropdown states
- **Event Handling**: Click outside, hover interactions
- **Time Formatting**: Clock display with/without seconds
- **Theme Integration**: Color application from theme config

### Integration Tests
- **Search Functionality**: Query handling and callback execution
- **Modal Interactions**: Open/close behavior for all dropdowns
- **Responsive Design**: Layout behavior across screen sizes
- **Theme Switching**: Visual updates on theme changes

### Visual Tests
- **Hover States**: All interactive element state changes
- **Animation Timing**: Smooth transitions and pulse effects
- **Color Consistency**: Theme color application
- **Typography**: Font rendering and spacing