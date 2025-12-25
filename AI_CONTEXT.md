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
| **Frontend Logger** | Chrome Extension (v3) | Captures DMs and Scraping events. |
| **Stealth Bridge** | Python (IPC Server) | Enriches browser data with Operator ID; saves to local SQLite. |
| **Sync Engine** | Python (Oracle SDK) | "GitHub-Style" Delta Sync between Local SQLite and Cloud Oracle. |
| **Cloud Core** | Oracle ATP (Always Free) | The central source of truth for the entire distributed team. |
| **Command Center** | Next.js 16 + React 19 | Management, Analytics, and CRM write-layer. |

### Data Flow: The "Stealth Bridge"
1. **Capture:** Browser Extension detects a sent DM.
2. **IPC:** Sends JSON packet `{target, message}` to the local Python Host via Windows Registry registered bridge.
3. **Enrich:** Python Host adds the persistent `OPERATOR_NAME` and `ACTOR_USERNAME`.
4. **Queue:** Data is saved to `LOCAL_DATA.db` (SQLite) immediately (Offline-first).
5. **Sync:** Background thread pushes new logs to Oracle and pulls updated prospect statuses from Oracle.

---

## 🗄️ 3. Oracle Database Relational Model (Verified)

The system uses a highly optimized schema designed for high-concurrency and low-bandwidth delta syncing.

### **A. User & Identity Management**
*   **`USERS`**: The link between Auth identities and outreach personas.
    *   `EMAIL` (PK): Google Account email.
    *   `NAME`: Human name from Google.
    *   `OPERATOR_NAME`: The "Identity" used in the outreach logs.
*   **`OPERATORS`**: The global directory.
    *   `OPERATOR_NAME` (PK): Primary identifier for a team member.

### **Outreach Tables**
- **`ACTORS`**: Instagram accounts used for outreach.
  - `USERNAME` (PK), `OWNER_OPERATOR`, `STATUS`, `CREATED_AT`
- **`ACTOR_PROFILES`**: Relationship between accounts and operators.
  - `ACTOR_USERNAME`, `ASSIGNED_OPERATOR`, `CREATED_AT`
- **`PROSPECTS`**: Master list of leads and their status.
  - `TARGET_USERNAME` (PK), `STATUS`, `OWNER_ACTOR`, `NOTES`, `FIRST_CONTACTED`, `LAST_UPDATED`, `EMAIL`, `PHONE_NUMBER`, `SOURCE_SUMMARY`
- **`OUTREACH_LOGS`**: Global history of all messages sent.
  - `LOG_ID` (PK), `TARGET_USERNAME`, `ACTOR_USERNAME`, `MESSAGE_TEXT`, `CREATED_AT`

### **Governance & Audit (New)**
- **`TEAM_GOALS`**: Shared suggested limits (e.g., MAX_DAILY_DMS).
- **`OPERATOR_GOALS`**: Personal overrides for team goals.
- **`AUDIT_LOGS`**: Detailed history of administrative actions (transfers, goal changes).

---

## 🗓️ Development Status
- **Auth & Identity**: Fully implemented with searchable onboarding.
- **Core Dashboard**: Live stats, real-time activity feed, and performance charts.
- **Leads Management**: Server-side search, status updates, and notes.
- **Analytics**: Dynamic time-range tracking (7D/30D/90D) and peak activity heatmaps.
- **Governance**: Server actions for Actor/Lead transfers and Democratic Goal setting.
- **Optimization**: Passing production build with full caching and rate limiting.


## ⚡ 4. Next.js 16 Implementation Details

### **Authorization & The Gatekeeper**
Access is strictly controlled via `app/(dashboard)/layout.tsx`.
- **Level 1:** `session.user` must exist (Google Login).
- **Level 2:** `session.user.operator_name` must be set.
- **Onboarding Page:** A searchable combobox allows users to claim existing identities or create new ones.

### **Data Access Patterns**
- **Driver:** `oracledb` in Thin Mode (Pure JS).
- **Pooling:** Max 10 connections to respect Oracle Free Tier OCPU limits.
- **Caching:**
    - `getCachedStats`: Revalidates every 60s.
    - `getCachedRecentLogs`: Revalidates every 30s.
- **Security:**
    - **Input:** Mandatory `zod` parsing for all Server Actions.
    - **Database:** Strict use of bind variables (`:params`) to eliminate SQL injection risk.
    - **Usage:** Rate limiting per user/IP using `lru-cache`.

---

## 🛠️ 5. Development Guidelines
- **UI:** Strictly use Shadcn + Tailwind 4. Dark Purple aesthetic is mandatory.
- **Errors:** All pages must have an `error.tsx` boundary to handle Oracle connection timeouts.
- **Icons:** Use `lucide-react`.
- **Database:** Never write raw SQL strings with interpolation. Always use the `dbQuery` helper.
