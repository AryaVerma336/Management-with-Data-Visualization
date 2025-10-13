# Store Management System - Design Guidelines

## Design Approach: Modern Dashboard System
**Selected Framework:** Inspired by Linear, Vercel Dashboard, and modern SaaS productivity tools
**Rationale:** Utility-focused inventory management requires clarity, efficiency, and data readability. Clean, minimal aesthetics with strategic use of color for status indicators and data visualization.

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 220 13% 9%
- Background Elevated: 220 13% 12%
- Background Subtle: 220 10% 15%
- Text Primary: 220 9% 98%
- Text Secondary: 220 9% 70%
- Text Tertiary: 220 9% 50%

**Accent Colors:**
- Primary Brand: 217 91% 60% (Modern blue for actions, CTAs)
- Success/In Stock: 142 71% 45% (Green for positive states)
- Warning/Low Stock: 38 92% 50% (Amber for alerts)
- Danger/Out of Stock: 0 84% 60% (Red for critical states)
- Info/Neutral: 217 91% 60% (Blue for information)

**Chart Colors:** Use a harmonious palette derived from primary:
- Chart 1: 217 91% 60%
- Chart 2: 142 71% 45%
- Chart 3: 280 65% 60%
- Chart 4: 38 92% 50%
- Chart 5: 340 82% 52%

### B. Typography

**Font Family:**
- Primary: 'Inter' via Google Fonts CDN
- Monospace (for data): 'JetBrains Mono' for numerical values, SKUs

**Hierarchy:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Data Labels: text-sm font-medium (14px)
- Metadata/Captions: text-xs text-gray-400 (12px)

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section gaps: gap-6 to gap-8
- Card spacing: p-6
- Form field gaps: space-y-4
- Grid gaps: gap-4 to gap-6

**Container Widths:**
- Max width: max-w-7xl mx-auto
- Sidebar: w-64 (256px fixed)
- Content area: flex-1 with proper padding

---

## D. Component Library

### Navigation Structure

**Sidebar Navigation (Fixed Left):**
- Dark background (220 13% 9%)
- Width: 256px (w-64)
- Icons from Heroicons (outline style)
- Active state: Subtle background (220 10% 15%) with primary text color
- Hover: Background (220 13% 12%)
- Sections: Dashboard, Inventory, Products, Analytics, Reports, Settings
- Language switcher at bottom with flag icons + text labels

**Top Header Bar:**
- Height: 64px (h-16)
- Contains: Breadcrumb navigation, search bar, user profile, notifications
- Background: 220 13% 12%
- Border bottom: 1px solid with 15% opacity

### Dashboard Components

**Stat Cards (4-column grid on desktop):**
- Background: 220 13% 12%
- Border: 1px solid with 10% opacity
- Padding: p-6
- Contains: Icon (top-left), Label (text-sm text-gray-400), Value (text-2xl font-semibold), Change indicator with arrow
- Hover: Subtle lift with shadow

**Data Tables:**
- Striped rows: Alternate backgrounds (220 13% 12% / 220 10% 15%)
- Header: Sticky, font-medium, text-sm, uppercase tracking-wide
- Cell padding: px-6 py-4
- Action buttons: Icon buttons (edit, delete) appearing on row hover
- Status badges: Pill-shaped with appropriate status colors
- Pagination: Bottom-right with page numbers and prev/next

**Chart Containers:**
- Background: 220 13% 12%
- Border radius: rounded-lg
- Padding: p-6
- Title: text-lg font-semibold mb-4
- Chart library: Chart.js via CDN
- Chart types: Line (stock trends), Bar (category comparison), Doughnut (stock distribution)

### Forms & Inputs

**Input Fields:**
- Background: 220 10% 15%
- Border: 1px solid with 20% opacity
- Focus: Primary color ring (ring-2 ring-primary/50)
- Padding: px-4 py-2.5
- Height: h-11
- Rounded: rounded-md

**Buttons:**
- Primary: Background primary color, text white, px-6 py-2.5, rounded-md
- Secondary: Border variant with outline-1, hover background subtle
- Danger: Red background for destructive actions
- Icon buttons: p-2, rounded-md, hover background

**Select/Dropdown:**
- Same styling as inputs
- Chevron icon indicator (Heroicons)
- Options: Dark dropdown menu with hover states

### Modal & Overlays

**Add/Edit Product Modal:**
- Backdrop: Black with 50% opacity
- Modal: 220 13% 12% background, max-w-2xl
- Header: Border-bottom separator
- Footer: Action buttons aligned right
- Form layout: Two-column grid for efficiency

**Confirmation Dialogs:**
- Centered, max-w-md
- Clear action buttons (Cancel/Confirm)
- Icon for visual context

### Data Visualization Specifics

**Dashboard Layout:**
- Top row: 4 stat cards (grid-cols-4)
- Second row: Stock level chart (col-span-8) + Category distribution (col-span-4)
- Third row: Recent activity table + Low stock alerts sidebar

**Charts Configuration:**
- Background: transparent to inherit card background
- Grid lines: Subtle with 10% opacity
- Tooltips: Dark background with white text
- Legend: Positioned top-right, horizontal layout
- Responsive: Maintain aspect ratio, scale gracefully

### Multi-Language Implementation

**Language Switcher:**
- Dropdown in sidebar footer
- Flags + Language names (English, Español, Français, 中文)
- Current language highlighted
- Instant switching without page reload
- Store preference in localStorage

**Text Handling:**
- All UI text stored in language objects
- RTL support consideration for future
- Number/date formatting per locale

---

## E. Interaction Patterns

**Minimal Animations:**
- Button hover: Subtle background change (150ms ease)
- Modal: Fade in backdrop + scale modal (200ms ease-out)
- Table row hover: Background transition (100ms)
- Chart: No entry animations (immediate render for data clarity)
- Sidebar nav: Instant active state change

**Loading States:**
- Skeleton loaders for tables (shimmer effect)
- Spinner for async actions (centered in button)
- Progress indicators for bulk operations

---

## Key Dashboard Sections

1. **Overview Dashboard:** Stat cards, trend charts, recent activity
2. **Inventory List:** Filterable table with search, bulk actions, export
3. **Product Detail:** Full product info, stock history chart, edit form
4. **Analytics:** Multi-chart view with date range filters
5. **Add Product:** Comprehensive form with image upload placeholder, category selection, pricing
6. **Low Stock Alerts:** Dedicated view with action items

**Images:** No hero image needed. Product placeholder images in inventory cards and detail views. Empty state illustrations for "no products" scenarios.