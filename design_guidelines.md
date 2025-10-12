# BIIT Project Progress Monitoring System - Mobile UI/UX Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Instagram's clean, modern mobile interface combined with productivity apps like Notion and Linear for data-rich displays. The academic context requires professional clarity while maintaining visual appeal for student engagement.

**Core Design Principles**:
- Mobile-first clarity with single-column layouts
- Information hierarchy through card-based organization
- Consistent navigation patterns across all 33 screens
- Role-specific visual differentiation while maintaining unified brand

---

## Color Palette

**Light Mode**:
- **Primary Blue**: 210 100% 50% (Instagram-inspired vibrant blue)
- **Background**: 0 0% 98% (Off-white for reduced eye strain)
- **Surface/Cards**: 0 0% 100% (Pure white)
- **Text Primary**: 220 20% 10% (Near black with slight blue tint)
- **Text Secondary**: 220 10% 45% (Muted gray)
- **Border/Divider**: 220 15% 90% (Subtle gray borders)
- **Success**: 142 76% 36% (Task completion/approval)
- **Warning**: 38 92% 50% (Pending items)
- **Error**: 0 84% 60% (Overdue/alerts)

**Dark Mode**:
- **Primary Blue**: 210 100% 55% (Slightly lighter for contrast)
- **Background**: 220 15% 8% (Dark blue-tinted background)
- **Surface/Cards**: 220 12% 12% (Elevated card surface)
- **Text Primary**: 0 0% 95% (Near white)
- **Text Secondary**: 220 10% 65% (Light gray)
- **Border/Divider**: 220 15% 20% (Subtle dark borders)

---

## Typography

**Font System** (Google Fonts via CDN):
- **Primary**: Inter (clean, modern, excellent mobile readability)
- **Secondary/Accent**: Poppins (headers, emphasis)

**Mobile Type Scale**:
- **Hero/Dashboard Titles**: text-2xl font-bold (24px)
- **Screen Headers**: text-xl font-semibold (20px)
- **Card Titles**: text-base font-semibold (16px)
- **Body Text**: text-sm (14px)
- **Secondary/Meta**: text-xs (12px)
- **Captions**: text-xs text-opacity-70 (12px muted)

---

## Layout System

**Mobile Container**:
- Max width: 428px (iPhone Pro Max)
- Optimal width: 375px-390px (most common mobile screens)
- Padding: px-4 (16px horizontal)
- Vertical spacing: py-4 to py-6 between sections

**Spacing Primitives** (Tailwind units):
- **Micro**: 1, 2 (4px, 8px) - icon padding, tight spacing
- **Standard**: 4 (16px) - card padding, list item spacing
- **Section**: 6, 8 (24px, 32px) - between major sections
- **Screen Padding**: 4 (16px) - horizontal screen margins

**Grid System**:
- Single column primary (mobile-first)
- Two-column for stats/metrics (grid-cols-2 gap-3)
- Three-column for icon grids only (grid-cols-3)

---

## Component Library

### Navigation
**Bottom Navigation Bar** (Fixed, 5 tabs):
- Height: h-16
- Items: Dashboard, Meetings, Tasks, Queue, Profile
- Active state: Blue fill with icon color change
- Icons: Heroicons outline (inactive), solid (active)
- Labels: text-xs below icons

**AppBar** (Top):
- Height: h-14
- Title: text-lg font-semibold centered or left-aligned
- Actions: Icon buttons (notifications, settings, search)
- Back button on detail screens
- Shadow: shadow-sm for subtle elevation

### Cards & Lists
**Project Cards**:
- Rounded: rounded-xl
- Padding: p-4
- Shadow: shadow-md
- Border: Optional 1px border in dark mode
- Content: Icon/Avatar + Title + Meta + Action button

**Task List Items**:
- Compact height (py-3)
- Left accent bar for status (4px colored border-l-4)
- Checkbox or status indicator
- Right chevron for navigation

**Group/Student Cards**:
- Avatar thumbnails (w-10 h-10 rounded-full)
- Two-line layout: Name + Secondary info
- Status badges (rounded-full px-2 py-1 text-xs)

### Data Display
**Stats Grid**:
- 2-column layout (grid-cols-2 gap-3)
- Cards with: Large number (text-2xl font-bold) + Label (text-xs)
- Icons in top-left corner (w-8 h-8)

**Progress Bars**:
- Height: h-2
- Rounded: rounded-full
- Background: bg-gray-200 (light) / bg-gray-700 (dark)
- Fill: bg-blue-500

**Charts** (fl_chart placeholders):
- Bar charts for analytics (Queue Dashboard, Committee overview)
- Line charts for progress tracking
- Pie/Donut for allocation distribution
- Min height: h-48 for readability

### Forms & Inputs
**Text Fields**:
- Height: h-12
- Rounded: rounded-lg
- Border: 1px solid, blue on focus
- Padding: px-4
- Dark mode: bg-gray-800 with lighter border

**Buttons**:
- **Primary**: bg-blue-500 text-white h-12 rounded-lg
- **Secondary**: border border-blue-500 text-blue-500 h-12 rounded-lg
- **Icon Buttons**: w-10 h-10 rounded-full centered icon

**Dropdowns/Select**:
- Same styling as text fields
- Chevron-down icon on right
- Full-width on mobile

### Modals & Overlays
**Bottom Sheet** (for mobile):
- Slide up from bottom
- Rounded top corners (rounded-t-3xl)
- Drag handle at top
- Max height: 80vh with scroll

**Dialog/Modal**:
- Centered overlay
- Max width: 90vw
- Rounded: rounded-2xl
- Backdrop blur effect

---

## Screen-Specific Patterns

### Dashboard Screens (All Roles)
- Stats grid at top (2-col)
- Recent activity cards below
- Quick actions as floating buttons or card CTAs
- Pull-to-refresh animation

### List Screens (Tasks, Meetings, Groups)
- Search bar at top (sticky)
- Filter chips (horizontal scroll)
- List items with swipe actions (optional)
- Empty state illustrations when no data

### Detail Screens
- Hero section: Avatar/Icon + Title + Key meta
- Tabbed sections for related content
- Action buttons in AppBar or floating
- Comments/Timeline section at bottom

### Assignment/Creation Screens
- Step indicator if multi-step (progress dots)
- Form sections with clear labels
- Bottom sticky submit button
- Input validation states

---

## Interaction & Animation

**Transitions**:
- Page transitions: Slide (350ms ease-in-out)
- Card interactions: Scale up slightly on tap (scale-105)
- List item reveal: Fade in + slide up stagger

**Micro-interactions**:
- Button press: Subtle scale down (active:scale-95)
- Checkbox/toggle: Smooth slide animation
- Pull-to-refresh: Custom spinner matching theme

**Loading States**:
- Skeleton screens for content loading
- Shimmer effect on card placeholders
- Spinner for button actions

---

## Role-Specific Visual Cues

**Committee** (15 screens): 
- Accent color for admin actions: Amber highlights for critical actions

**Student** (6 screens):
- Simplified layouts, focus on tasks and grades
- Larger touch targets for mobile usage

**Supervisor** (7 screens):
- Grading interfaces with rubric views
- Emphasis on student performance charts

**Queue Handler** (5 screens):
- Real-time update indicators (pulse animation)
- Priority color coding (red/yellow/green)

---

## Images & Icons

**Icons**: Heroicons (via CDN)
- Outline style for inactive states
- Solid style for active/selected states
- Size: w-5 h-5 for navigation, w-6 h-6 for emphasis

**Avatars/Thumbnails**:
- Use placeholder initials (first letter of name)
- Background: Blue gradient variants
- Border: 2px white border in group displays

**Illustrations**:
- Empty states: Simple line illustrations (undraw.co style)
- Login screen: Minimal geometric background pattern
- No large hero images (mobile-focused, information-dense app)

---

## Accessibility & Usability

- Touch targets: Minimum 44x44px (h-11 w-11)
- Contrast ratios: WCAG AA compliant in both themes
- Font sizes: Never below 12px (text-xs)
- Focus indicators: 2px blue outline on keyboard navigation
- Dark mode: Proper contrast preservation for all text and UI elements