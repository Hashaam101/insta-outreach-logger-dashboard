# 🤖 Project Context: InstaCRM Dashboard

## 📌 Project Identity
- **Name**: InstaCRM Command Center
- **Type**: Next.js 16 Web Dashboard (Management Layer)
- **Purpose**: A centralized hub for managing a distributed team of Instagram outreach operators. It tracks real-time DMs, prospect statuses, and team performance by syncing with a central Oracle ATP database.

## 🏗️ System Architecture

### 1. Identity & Onboarding (Gatekeeper)
- **Auth**: Google OAuth via Auth.js (NextAuth v5).
- **Identity Claiming**: Users must "claim" an identity from the `OPERATORS` directory or create a new one. This link is persisted in the `USERS` table.
- **Protection**: Server-side layout checks (`app/(dashboard)/layout.tsx`) enforce authentication and identity establishment before allowing access to dashboard routes.

### 2. Data Strategy (Thin & Stealth)
- **Database**: Oracle Autonomous Transaction Processing (ATP).
- **Driver**: `node-oracledb` in **Thin Mode** (pure JS, no instant client required).
- **Caching**: Multi-layer caching strategy using Next.js `unstable_cache` (ISR) and React `cache` (memoization) to minimize OCPU usage on Oracle Free Tier.
- **Security**: Strict input validation via `zod` and mandatory use of Oracle bind variables to prevent SQL injection.

---

## 🗄️ Oracle Database Schema (Verified)

### **Identity Tables**
- **`USERS`**: Maps Google credentials to internal operators.
  - `EMAIL` (PK), `NAME`, `OPERATOR_NAME`, `CREATED_AT`
- **`OPERATORS`**: Global directory of authorized team members.
  - `OPERATOR_NAME` (PK), `CREATED_AT`

### **Outreach Tables**
- **`ACTORS`**: Instagram accounts used for outreach.
  - `USERNAME` (PK), `OWNER_OPERATOR`, `STATUS`, `CREATED_AT`
- **`ACTOR_PROFILES`**: Relationship between accounts and operators.
  - `ACTOR_USERNAME`, `ASSIGNED_OPERATOR`, `CREATED_AT`
- **`PROSPECTS`**: Master list of leads and their status.
  - `TARGET_USERNAME` (PK), `STATUS`, `OWNER_ACTOR`, `NOTES`, `FIRST_CONTACTED`, `LAST_UPDATED`, `EMAIL`, `PHONE_NUMBER`, `SOURCE_SUMMARY`
- **`OUTREACH_LOGS`**: Global history of all messages sent.
  - `LOG_ID` (PK), `TARGET_USERNAME`, `ACTOR_USERNAME`, `MESSAGE_TEXT`, `CREATED_AT`

---

## 🗓️ Development Status
- **Auth & Identity**: Fully implemented with searchable onboarding.
- **Core Dashboard**: Live stats, real-time activity feed, and performance charts.
- **Leads Management**: Server-side search, status updates, and notes.
- **Analytics**: Dynamic time-range tracking (7D/30D/90D) and peak activity heatmaps.
- **Optimization**: Passing production build with full caching and rate limiting.