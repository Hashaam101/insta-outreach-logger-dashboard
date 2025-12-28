# InstaCRM Command Center

**The distributed intelligence hub for stealthy, high-volume Instagram outreach operations.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)
![Oracle](https://img.shields.io/badge/Database-Oracle%20ATP-F80000?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square)

---

## Overview

InstaCRM Command Center is the web-based management dashboard for a distributed Instagram outreach ecosystem. While desktop agents handle stealthy DM logging without triggering Instagram's bot detection, this dashboard provides centralized analytics, CRM pipeline management, and team governance.

### Core Philosophy

- **Zero-Network Footprint**: Desktop agents use Chrome Native Messaging to avoid browser network requests
- **Offline-First Sync**: Local SQLite cache with delta sync to Oracle ATP
- **Distributed Identity**: Multiple Operators manage multiple Actors (Instagram accounts)
- **Governance Layer**: Team-wide goals and rules with soft warning enforcement

---

## Architecture

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

### Database Schema (Planned)

The system uses a normalized Oracle schema with standardized ID formats:

| Table | Primary Key Format | Description |
|-------|-------------------|-------------|
| `OPERATORS` | `OPR-A1DC2A4B` | Human team members |
| `ACTORS` | `ACT-A1DC2A4B` | Instagram accounts (owned by operators) |
| `TARGETS` | `TAR-A1dC2h4B` | Prospect leads with pipeline status |
| `EVENT_LOGS` | `ELG-A1dC2h4Bw8` | Parent table for all event types |
| `OUTREACH_LOGS` | `OLG-A1dC2h4Bw8` | Child extension (1:1 with EVENT_LOGS) |
| `GOALS` | `GOL-A1B2C3D4` | Performance targets (team or individual) |
| `RULES` | `RUL-X9Y8Z7W6` | Frequency caps and interval spacing |

### Status Enums

**Target Pipeline (`TAR_STATUS`)**:
`Cold No Reply` -> `Replied` -> `Warm` -> `Booked` -> `Paid` -> `Tableturnerr Client` | `Excluded`

**Actor Status (`ACT_STATUS`)**:
`Active` | `Suspended By Team` | `Suspended By Insta` | `Discarded`

**Goal Metrics**:
`Total Messages Sent` | `Unique Profiles Contacted` | `Replies Received` | `Warm Leads Generated` | `Bookings Made` | `Payments Received`

---

## Features

### Dashboard Home (`/`)
- Real-time KPI cards (Targets, Logs, Actors, Operators)
- Recent activity feed with live updates
- Status distribution chart
- My Data vs Team Data toggle

### Analytics (`/analytics`)
- Outreach volume trends (Recharts)
- Activity heatmap by hour
- Operator leaderboard
- Contact enrichment stats (Email/Phone coverage)

### Leads CRM (`/leads`)
- Paginated data table with search
- Filter by `TAR_STATUS` pipeline stage
- Inline status updates
- Contact info display (Email, Phone, Source)

### Actors (`/actors`)
- Performance grid with DM counts
- Status management (Active/Suspended/Discarded)
- Top performers leaderboard

### Logs (`/logs`)
- Paginated event history
- Filter by Operator, Actor, Event Type
- Message text preview

### Settings (`/settings`)
- View scope toggle (My Data vs Team)
- Operator profile info

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5.0 |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Database | Oracle ATP (Thin Mode via `oracledb`) |
| Auth | Auth.js v5 (Google OAuth) |
| Charts | Recharts |
| Caching | Next.js ISR + React `cache()` + `unstable_cache()` |

### Caching Strategy

```typescript
// Dual-layer caching pattern
export const getCachedStats = cache(unstable_cache(
  async () => { /* ... */ },
  ["dashboard-stats"],
  { revalidate: 60, tags: ["stats", "global"] }
));
```

| Function | TTL | Tags |
|----------|-----|------|
| `getCachedStats` | 60s | stats, global |
| `getCachedDashboardMetrics` | 60s | logs, metrics |
| `getCachedRecentLogs` | 30s | logs, recent |
| `getCachedOutreachVolume` | 1h | logs, analytics |
| `getCachedActivityHeatmap` | 1h | logs, analytics |
| `getPagedLeads` | No cache | Realtime |
| `getPagedLogs` | No cache | Realtime |

---

## Security

- **SQL Injection Prevention**: All queries use bind variables (`:params`)
- **Input Validation**: Zod schemas for all server actions
- **Rate Limiting**: LRU cache-based per-user throttling
- **Connection Pooling**: Max 10 connections (Oracle Free Tier limit)

---

## Getting Started

### Prerequisites

- Node.js 20+
- Oracle ATP Cloud Account (Free Tier works)
- Google Cloud Console Project (OAuth credentials)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hashaam101/insta-outreach-logger-dashboard.git
cd insta-outreach-logger-dashboard

# Install dependencies
npm install
```

### Environment Configuration

Create `.env.local`:

```env
# Oracle ATP Connection (Thin Mode)
ORACLE_CONN_STRING=tcps://adb.region.oraclecloud.com:1522/...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Auth.js
AUTH_SECRET=random-32-character-string
AUTH_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Project Structure

```
app/
  (dashboard)/
    page.tsx           # Dashboard home
    analytics/         # Charts and trends
    leads/             # CRM pipeline
    actors/            # Account management
    logs/              # Event history
    settings/          # Preferences
  layout.tsx           # Root layout with auth

components/
  ui/                  # Shadcn components
  dashboard/           # Dashboard-specific components

lib/
  data.ts              # Data fetching functions
  db/                  # Database utilities
  auth.ts              # Auth configuration
```

---

## Related Projects

- **Desktop Agent**: Chrome Extension + Python Bridge (separate repository)
- **Android Companion**: InstaSniffer accessibility service (planned)

---

## Documentation

- [`schema.dbml`](./schema.dbml) - Database schema definition
- [`AI_CONTEXT.md`](./AI_CONTEXT.md) - Technical context for AI assistants
- [`project_workflow.drawio`](./project_workflow.drawio) - Architecture diagrams

---

## License

Private - All rights reserved.
