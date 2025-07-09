# DASHBOARD RESTORATION TASKS

## **CRITICAL INSTRUCTION**

You are restoring the dashboard to match the EXACT visual design shown in the provided screenshot. **IGNORE ALL ENVIRONMENTAL DETECTION FEATURES** and  **REMOVE ALL NEW ARCHITECTURE** . Focus ONLY on recreating the visual layout and content shown in the image.

---

## **TASK 1: REMOVE ENVIRONMENTAL DETECTION SYSTEM**

**PROMPT:**

```
REMOVE the following files completely - delete them entirely:
- src/utils/environment.ts
- src/components/dashboard/ConditionalDashboardLayout.tsx  
- src/components/dashboard/DevelopmentDashboardLayout.tsx
- src/components/dashboard/ProductionDashboardLayout.tsx
- src/components/dashboard/QuadrantSystem.tsx
- src/tests/environment-switching.test.ts

ALSO REMOVE these new renamed components:
- src/components/dashboard/SmartAccessHub.tsx
- src/components/dashboard/AICommandCenter.tsx  
- src/components/dashboard/MissionControl.tsx
- src/components/dashboard/ProductivityNexus.tsx

These were replacements that we don't want. Keep ONLY the original components.
```

---

## **TASK 2: RESTORE ORIGINAL DASHBOARD PAGE**

**PROMPT:**

```
COMPLETELY REPLACE src/pages/Dashboard.tsx with this EXACT content - the original working dashboard:

```typescript
import React, { useState } from 'react';
import { DashboardLayout, PanelSystem } from '../components/dashboard';

export default function Dashboard() {
  const [panels] = useState([
    { id: 'smart-hub', type: 'SmartHub', title: 'Smart Access Hub', position: { x: 0, y: 0, width: 6, height: 6 } },
    { id: 'ai-chat', type: 'AIChat', title: 'AI Command Center', position: { x: 6, y: 0, width: 6, height: 6 } },
    { id: 'task-manager', type: 'TaskManager', title: 'Mission Control', position: { x: 0, y: 6, width: 6, height: 6 } },
    { id: 'productivity', type: 'Productivity', title: 'Productivity Nexus', position: { x: 6, y: 6, width: 6, height: 6 } }
  ]);

  return (
    <DashboardLayout>
      <PanelSystem panels={panels} />
    </DashboardLayout>
  );
}
```

Do NOT use any of the new conditional layout or environmental detection.

```

---

## **TASK 3: RESTORE ORIGINAL DASHBOARD LAYOUT COMPONENT**

**PROMPT:**
```

MODIFY src/components/dashboard/DashboardLayout.tsx to match the EXACT header design from the screenshot:

The header should have:

* Left: "Lucaverse Hub" logo/title with globe icon
* Center: Search bar with "Search everywhere..." placeholder
* Right: Time display showing "14:45:03"

Use dark teal/cyan theme (#14b8a6, #0891b2) with proper spacing and the EXACT layout shown in the image.

REMOVE any development mode indicators or environmental detection references.

```

---

## **TASK 4: FIX SMART HUB COMPONENT CONTENT**

**PROMPT:**
```

MODIFY src/components/dashboard/SmartHub.tsx to EXACTLY match the screenshot content:

TOP SECTION - Search bar:

* "Search bookmarks & history..." placeholder

MIDDLE SECTION - Quick Tags (in a grid):

* Work, Dev, Social, Docs, Tools, Research (6 buttons in 2 rows)

BOTTOM LEFT - "MOST VISITED" section:

* GitHub Dashboard (github.com, 23w, visit count)
* Claude AI (similar format)

BOTTOM RIGHT - Two sections:

* "RECENT BOOKMARKS" (empty state: "No items yet")
* "PINNED ITEMS" with GitHub Dashboard and Gmail entries

Use the EXACT styling, colors, and layout shown in the screenshot. Dark theme with teal accents.

```

---

## **TASK 5: FIX AI CHAT COMPONENT CONTENT**

**PROMPT:**
```

MODIFY src/components/dashboard/AIChat.tsx to EXACTLY match the screenshot:

TOP SECTION:

* "New Chat" button with star icon
* Dropdown showing "Claude (Sonnet)"
* Second dropdown showing "Claude 3.5 Sonnet"

MIDDLE SECTION - Mode buttons in a row:

* Explain, Code Review, Debug, Optimize, Translate (5 buttons)

MAIN AREA:

* "New Chat" section with "New conversation" text
* Another "New Chat" section below
* Text input area with "Please explain this concept in simple terms:" placeholder
* "Clear All" button

Use the EXACT layout, button styles, and dark teal theme from the screenshot.

```

---

## **TASK 6: FIX TASK MANAGER COMPONENT CONTENT**

**PROMPT:**
```

MODIFY src/components/dashboard/TaskManager.tsx to EXACTLY match the screenshot:

TOP STATS ROW:

* "1/3 Completed" | "33% Progress" | "1 High Priority"

MAIN TASKS SECTION with "+ Add" button:
Three task items with progress bars:

1. Red priority indicator, progress bar ~80%
2. Yellow priority indicator, progress bar ~60%
3. Blue/green priority indicator, progress bar ~40%

SUBTASKS SECTION with "+ Add" button:

* "Design glassmorphism components" (0/0 completed)

BOTTOM FILTERS:

* Daily, Meeting, Research, Code (4 filter buttons)

BOTTOM ACTIONS:

* Export, Clear Done (2 action buttons)

Match the EXACT colors, progress bar styles, and layout from the screenshot.

```

---

## **TASK 7: FIX PRODUCTIVITY COMPONENT CONTENT**

**PROMPT:**
```

MODIFY src/components/dashboard/Productivity.tsx to EXACTLY match the screenshot:

CENTER - Large circular timer display:

* Shows "NaN:NaN" in large text
* Circular progress indicator (currently empty/reset state)

TOP BUTTONS ROW:

* Focus, Break, Long (3 mode buttons)

BOTTOM BUTTONS ROW:

* Start, Reset (2 control buttons)

TIMER SETTINGS:

* "Focus: 25 min"
* "Break: 5 min"

RIGHT SIDE - "Smart Notes" section:

* Title with icons
* "Capture thoughts, insights, and breakthroughs..." placeholder text

Use the EXACT circular timer design, button layout, and styling from the screenshot.

```

---

## **TASK 8: UPDATE COMPONENT EXPORTS**

**PROMPT:**
```

MODIFY src/components/dashboard/index.ts to export ONLY the original components:

```typescript
export { default as DashboardLayout } from './DashboardLayout';
export { default as PanelSystem } from './PanelSystem'; 
export { default as SmartHub } from './SmartHub';
export { default as AIChat } from './AIChat';
export { default as TaskManager } from './TaskManager';
export { default as Productivity } from './Productivity';
```

REMOVE all exports for the new renamed components and environmental detection components.

```

---

## **TASK 9: APPLY CONSISTENT DARK THEME STYLING**

**PROMPT:**
```

ENSURE all components use the EXACT color scheme from the screenshot:

PRIMARY COLORS:

* Background: Dark navy/black (#0f172a, #1e293b)
* Panels: Dark teal/gray (#164e63, #0f3a47)
* Accents: Bright teal/cyan (#14b8a6, #06b6d4)
* Text: White/light gray (#f8fafc, #e2e8f0)

COMPONENT STYLING:

* Rounded corners on panels and buttons
* Subtle shadows and borders
* Proper spacing matching the screenshot
* Consistent button and input field styling

Apply this theme consistently across ALL four dashboard components.

```

---

## **TASK 10: VERIFY GRID LAYOUT POSITIONING**

**PROMPT:**
```

ENSURE the PanelSystem displays the four components in EXACTLY this 2x2 grid layout:

TOP ROW:

* Smart Access Hub (left) | AI Command Center (right)

BOTTOM ROW:

* Mission Control (left) | Productivity Nexus (right)

Each quadrant should be equal size and match the proportions shown in the screenshot. The layout should be responsive but maintain the 2x2 grid structure.

VERIFY that when you run `npm run dev` and navigate to the dashboard, it shows the EXACT layout from the provided screenshot image.

```

---

## **VERIFICATION CHECKLIST**

After completing all tasks, the dashboard MUST show:

✅ **Header**: Lucaverse Hub logo + search bar + time display  
✅ **Top-left**: Smart Access Hub with quick tags, most visited, bookmarks  
✅ **Top-right**: AI Command Center with Claude dropdowns and mode buttons  
✅ **Bottom-left**: Mission Control with task progress and priority indicators  
✅ **Bottom-right**: Productivity Nexus with circular timer and Smart Notes  
✅ **Theme**: Dark teal/navy consistent with the screenshot  
✅ **Layout**: Perfect 2x2 grid matching the proportions  

**NO environmental detection, NO new components, NO conditional layouts - ONLY the original dashboard matching the screenshot exactly.**
```
