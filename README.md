# 📊 InstaCRM - Command Center

**The central intelligence and management hub for the Insta Outreach Logger ecosystem.**

![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20|%20React%2019%20|%20Tailwind%204-black?style=flat-square)
![Database](https://img.shields.io/badge/DB-Oracle%20ATP%20(Thin)-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Build%20Passing-green?style=flat-square)

## 📖 About The Project

InstaCRM is a high-performance management dashboard designed for distributed outreach teams. It provides real-time visibility into Instagram direct message activity, lead conversion pipelines, and operator performance.

Built with **Next.js 16** and **Oracle ATP**, the system is optimized for speed and security, featuring a stealthy data bridge that logs activity without triggering anti-bot mechanisms.

---

## ✨ Core Features

### 🚀 Command Center
- **Live Stats:** Real-time counters for Prospects, Messages, and Team activity.
- **Activity Feed:** Instant visibility into the latest DMs sent across the entire team.
- **Identity Gatekeeper:** Secure Google OAuth onboarding with searchable identity claiming.

### 📈 Advanced Analytics
- **Outreach Velocity:** Interactive charts tracking message volume trends.
- **Performance Leaderboards:** Rank operators and accounts by productivity.
- **Peak Activity Heatmap:** Visualize the most effective hours for team outreach.
- **Data Health:** Real-time monitoring of lead enrichment (Emails/Phones found).

### 🗂️ Lead Management
- **Leads Explorer:** Global search and filtering of all prospects.
- **Status Control:** Inline status updates (Cold -> Warm -> Booked).
- **Notes System:** Internal team commentary per prospect.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Oracle Autonomous Transaction Processing (node-oracledb Thin Mode)
- **Auth:** Auth.js v5 (Google OAuth)
- **UI:** Shadcn UI + Tailwind CSS v4
- **Charts:** Recharts
- **Caching:** ISR + Request Memoization

---

## 🗄️ Database Schema

The dashboard synchronizes with the following verified Oracle tables:

| Table | Primary Key | Description |
| :--- | :--- | :--- |
| **`USERS`** | `EMAIL` | Maps Google IDs to Operator names. |
| **`OPERATORS`** | `OPERATOR_NAME` | Global directory of team members. |
| **`ACTORS`** | `USERNAME` | Instagram accounts logging data. |
| **`PROSPECTS`** | `TARGET_USERNAME` | Master lead database with statuses. |
| **`OUTREACH_LOGS`** | `LOG_ID` | History of all DMs sent. |

---

## 🚀 Getting Started

1. **Clone & Install:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Copy `.env.example` to `.env.local` and add your Oracle ATP connection string and Google OAuth credentials.

3. **Run Development:**
   ```bash
   npm run dev
   ```

4. **Verify Build:**
   ```bash
   npm run build
   ```
