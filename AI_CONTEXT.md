# 🤖 AI Technical Context: InstaCRM Ecosystem

This document provides a deep-dive into the architecture, data flow, and design patterns of the **Insta Outreach Logger (Remastered)** and its **Command Center (Dashboard)**.

---

## 🎯 1. Core Mission & Problem Statement
Instagram employs sophisticated anti-bot detection that monitors network requests and behavioral patterns. Traditional CRMs fail because they trigger "Automated Behavior" flags.
**InstaCRM solves this by:**
1. **Zero-Network Footprint (Browser):** The extension makes **no** API calls. Data is passed via Native IPC to a local host.
2. **Distributed Identity:** Outreach is spread across multiple "Actors" (Insta accounts) and managed by multiple "Operators" (humans).
3. **Hybrid Identity Discovery:** Automated scraping of the logged-in user to establish identity without manual configuration.

---

## 🏗️ 2. System Architecture

### Component Breakdown
| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Desktop Agent** | Python/Chrome | Handles stealthy DM logging via Chrome Native Messaging. |
| **Oracle ATP** | Cloud Core | Central source of truth. Handles ID generation and Delta Sync. |
| **Web Dashboard** | Next.js 16 | The "Command Center" for Analytics, CRM, and Governance. |

### Architecture Diagram
```
+------------------+     +------------------+     +------------------+
|  DESKTOP AGENT   |     |   ORACLE ATP     |     |  WEB DASHBOARD   |
|  (Python/Chrome) |<--->|  (Cloud Core)    |<--->|   (Next.js 16)   |
+------------------+     +------------------+     +------------------+
        |                        |                        |
   Chrome Ext v3           Source of Truth          Command Center
   Stealth Bridge          Delta Sync               Analytics & CRM
   Local SQLite            ID Generation            Governance UI
```

### Data Flow: The "Stealth Bridge"
1. **Capture:** Browser Extension detects a sent DM.
2. **IPC:** Sends JSON packet `{target, message}` to the local Python Host via Windows Registry registered bridge.
3. **Enrich:** Python Host adds the persistent `OPERATOR_NAME` and `ACTOR_USERNAME`.
4. **Queue:** Data is saved to `LOCAL_DATA.db` (SQLite) immediately (Offline-first).
5. **Sync:** Background thread pushes new logs to Oracle and pulls updated prospect statuses from Oracle.

---

## 🗄️ 3. Oracle Database Relational Model (Verified)

The system uses a normalized Oracle schema with standardized ID formats.

### **Core Entities**
*   **`OPERATORS`** (`OPR-A1DC2A4B`): Human team members.
*   **`ACTORS`** (`ACT-A1DC2A4B`): Instagram accounts owned by operators.
*   **`TARGETS`** (`TAR-A1dC2h4B`): Prospect leads with pipeline status.

### **Logging System**
*   **`EVENT_LOGS`** (`ELG-A1dC2h4Bw8`): Parent table for all event types.
*   **`OUTREACH_LOGS`** (`OLG-A1dC2h4Bw8`): Child extension (1:1 with EVENT_LOGS).

### **Governance & Audit**
*   **`GOALS`** (`GOL-A1B2C3D4`): Performance targets (Team/Personal).
*   **`RULES`** (`RUL-X9Y8Z7W6`): Frequency caps and interval spacing limits.

### **Status Enums**
*   **Target Pipeline (`TAR_STATUS`)**: `Cold No Reply` -> `Replied` -> `Warm` -> `Booked` -> `Paid` -> `Tableturnerr Client` | `Excluded`
*   **Actor Status (`ACT_STATUS`)**: `Active` | `Suspended By Team` | `Suspended By Insta` | `Discarded`
*   **Goal Metrics**: `Total Messages Sent`, `Unique Profiles Contacted`, `Replies Received`, `Warm Leads Generated`, `Bookings Made`, `Payments Received`.

---

## ⚡ 4. Next.js 16 Implementation Details

### **Tech Stack**
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Database**: Oracle ATP (Thin Mode via `oracledb`)
- **Auth**: Auth.js v5 (Google OAuth)
- **Caching**: Next.js ISR + React `cache()` + `unstable_cache()`

### **Page Structure & Features**
- **Dashboard (`/`)**: Real-time KPI cards, Recent Activity Feed, Status Distribution.
- **Analytics (`/analytics`)**: Outreach Volume Trends, Heatmaps, Operator Leaderboard.
- **Leads (`/leads`)**: CRM Pipeline with paginated data table and inline status updates.
- **Actors (`/actors`)**: Performance grid and status management for Insta accounts.
- **Logs (`/logs`)**: Infinite scroll event history with advanced filters.
- **Settings (`/settings`)**: Operator profile and "My Data vs Team Data" toggle.

### **Caching Strategy (Dual-Layer)**
We use a dual-layer pattern: `React cache()` for request deduplication and `unstable_cache()` for ISR.

| Function | TTL | Tags |
|----------|-----|------|
| `getCachedStats` | 60s | stats, global |
| `getCachedDashboardMetrics` | 60s | logs, prospects, metrics |
| `getCachedRecentLogs` | 30s | logs, recent |
| `getCachedOutreachVolume` | 1h | logs, analytics |
| `getCachedActivityHeatmap` | 1h | logs, analytics |
| `getPagedLeads` | No cache | Realtime |
| `getPagedLogs` | No cache | Realtime |

### **Authorization & The Gatekeeper**
Access is strictly controlled via `app/(dashboard)/layout.tsx`.
- **Level 1:** `session.user` must exist (Google Login).
- **Level 2:** `session.user.operator_name` must be set.

---

## 🛠️ 5. Development Guidelines
- **UI:** Strictly use Shadcn + Tailwind 4. Dark Purple aesthetic is mandatory.
- **Errors:** All pages must have an `error.tsx` boundary to handle Oracle connection timeouts.
- **Icons:** Use `lucide-react`.
- **Database:** 
    - Never write raw SQL strings with interpolation. 
    - Always use bind variables (`:params`) to eliminate SQL injection risk.
    - Max 10 connections (Oracle Free Tier OCPU limit).

