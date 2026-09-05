# Enterprise Management & Data Visualization Platform (ApexManager)

> An enterprise-grade management, sales pipeline, inventory intelligence, and interactive data visualization platform built with React 18, Vite, Express, TypeScript, Tailwind CSS, and Recharts.

---

## 🌟 Key Features

### 📊 1. Executive Analytics & Data Visualization Studio
- **Real-Time KPIs**: Total Revenue, Order Volume, Inventory Valuation, and Active Automations with percentage change badges.
- **Financial Trajectory**: 12-Month Revenue vs. Gross Profit multi-series Area and Line Charts.
- **Regional Sales Distribution**: Geographic territory breakdown via horizontal bar charts.
- **Predictive AI Forecasting**: 3-Month forward projection model calculated via double exponential moving averages & confidence intervals.
- **Interactive Chart Studio**: Dynamic custom chart builder allowing users to choose datasets (Revenue, Stock Units, Unit Prices), dimensions (Categories, Regions), and visual formats (Bar, Line, Pie, Radar).

### 📦 2. Inventory & Supply Chain Management
- **SKU Tracking**: Comprehensive product catalog with cost/price margins, minimum reorder thresholds, and maximum capacity limits.
- **Stock Health Indicators**: Visual progress bars and automated badges (In Stock, Low Stock, Out of Stock).
- **Product Detail Inspector**: Instant modal overlay showing supplier ratings, unit economics, and stock history.
- **CSV Data Export & Bulk Management**: One-click data export to CSV/JSON format.

### 🛒 3. Sales & Orders Pipeline
- **Status Workflow**: Interactive order status pipeline (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Customer Directory**: Customer email tracking, regional assignment, and payment method logs.
- **Order Recorder**: Record new orders with dynamic status tracking and automated inventory updates.

### ⚡ 4. Automation & Script Execution Engine
- **Automated Routine Tasks**: Recreates and elevates automated script capabilities (file & folder cleanup, directory re-organization, email alert dispatchers, daily report engines).
- **Live Script Console**: Interactive terminal log stream displaying real-time script execution output.
- **Task Runner**: Execute background scripts on demand or manage automated cron-like schedules.

### 🏢 5. Suppliers & Vendor Directory
- **Vendor Scorecards**: Supplier rating stars, contact details, and fulfillment lead-time tracking.
- **Vendor Registration**: Add and monitor global logistics partners.

### 📋 6. System Audit & Activity Logs
- **Immutable Audit Trail**: Tracks all user actions, data modifications, and automated workflow triggers.
- **Command Palette (`Ctrl + K`)**: Quick keyboard search dialog to jump to any page or feature instantly.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS v3, Recharts, Lucide Icons, Wouter Router, Radix UI Components.
- **Backend**: Node.js, Express, TypeScript, Zod Schema Validation, Drizzle ORM.
- **State & Data Fetching**: TanStack React Query v5, i18next Multi-language support (EN, ES, FR, ZH).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AryaVerma336/Management-with-Data-Visualization.git
   cd Management-with-Data-Visualization
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` in your browser.

4. **Production Build & Type Check**
   ```bash
   npm run check
   npm run build
   npm start
   ```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/products` | GET / POST | List all products or create a new SKU |
| `/api/products/:id` | GET / PATCH / DELETE | Fetch, update, or remove a product |
| `/api/orders` | GET / POST | Fetch sales orders or record a new transaction |
| `/api/orders/:id/status` | PATCH | Update order fulfillment status |
| `/api/suppliers` | GET / POST | List vendor directory or register a supplier |
| `/api/tasks` | GET / POST | List automation workflows or create a schedule |
| `/api/tasks/:id/run` | POST | Trigger live execution of an automation script |
| `/api/analytics/overview` | GET | Aggregated KPI metrics & monthly history |
| `/api/analytics/forecasting` | GET | Predictive revenue projection dataset |
| `/api/export/:type` | GET | Export `products`, `orders`, or `tasks` as CSV/JSON |

---

## 📄 License
MIT License. Created by [Arya Verma](https://github.com/AryaVerma336).
