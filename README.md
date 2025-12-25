# 📊 InstaCRM Command Center

**The decentralized intelligence hub for high-volume Instagram outreach operations.**

![Version](https://img.shields.io/badge/Version-1.0.0-purple?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?style=flat-square)
![Oracle](https://img.shields.io/badge/Database-Oracle%20ATP-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)

## 🌟 The Vision
InstaCRM is built for distributed teams who need a **stealthy**, reliable way to track DM outreach. While our agents handle the logging on operator machines without triggering Instagram's bot detection, this dashboard provides the "Command Center" view—centralizing performance, analytics, and lead management into a single, high-performance web interface.

---

## ✨ Key Features

### 🚀 Management Dashboard
*   **Live Operations Feed:** Real-time stream of DMs being sent across the entire team.
*   **Consolidated Analytics:** Beautifully visualized outreach velocity, team leaderboard, and peak activity heatmaps.
*   **Identity Gatekeeper:** Secure Google OAuth onboarding with a searchable identity claiming system.

### 🗂️ CRM & Lead Control
*   **Advanced Leads Explorer:** A rich, searchable data grid for all targets in the system.
*   **Inline Status Management:** One-click status updates (e.g., Cold -> Warm -> Booked) that sync back to all operator agents.
*   **Persistence & Notes:** High-fidelity internal notes for every prospect, tagged by operator.

### 🛡️ Secure & Scalable
*   **Hardened Infrastructure:** Built with strict input validation, rate limiting, and SQL injection protection.
*   **Oracle Free-Tier Optimized:** Aggressive multi-layer caching ensures the system stays fast while remaining 100% free to host.

---

## 🏗️ Technical Architecture

| Layer | Implementation |
| :--- | :--- |
| **Framework** | **Next.js 16** + React 19 + TypeScript |
| **Styling** | **Tailwind CSS v4** + Shadcn UI |
| **Database** | **Oracle Autonomous Transaction Processing** (Thin Mode) |
| **Auth** | **Auth.js v5** (Google OAuth Provider) |
| **Analytics** | **Recharts** (SVG-based high-performance charts) |
| **Caching** | **Next.js ISR** + Request Memoization |

---

## 🗄️ Database Schema

The system synchronizes the following core Oracle tables:

| Table | Role | Key Data Points |
| :--- | :--- | :--- |
| **`USERS`** | Auth Mapping | Email, Human Name, Operator ID |
| **`OPERATORS`** | Directory | Global list of active outreach personas |
| **`ACTORS`** | Assets | Insta Handles, Owner Operator, Account Status |
| **`PROSPECTS`** | CRM Core | Target Username, Lead Status, Notes, Contact Data |
| **`OUTREACH_LOGS`**| Audit Trail | Message Content, Actor, Timestamp |

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 20+
*   Oracle ATP Cloud Account
*   Google Cloud Console Project (for OAuth)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Hashaam101/insta-outreach-logger-dashboard.git

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file based on `.env.example`:
*   `ORACLE_CONN_STRING`: Your ATP connection string (Thin Mode format).
*   `GOOGLE_CLIENT_ID` / `SECRET`: OAuth credentials.
*   `AUTH_SECRET`: Random 32-character string.

### 4. Deployment
```bash
# Run development server
npm run dev

# Build for production
npm run build
```

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.