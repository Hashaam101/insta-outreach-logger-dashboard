# 🚀 Project Plan: Insta Outreach Dashboard

This file serves as the comprehensive, step-by-step roadmap for building the "Insta Outreach Dashboard" using Next.js 16, Oracle ATP (Thin Mode), and Google Auth.

**Phase 1: Foundation & Infrastructure**
- [x] **Environment Setup:** Create `.env.local` and define strict types for environment variables (Oracle & Google Credentials).
- [x] **Database Connection:** Implement `src/lib/db.ts` using `node-oracledb` in **Thin Mode**. Create a connection pool singleton.
- [x] **Connection Test:** Create a temporary script or route to verify Next.js can query the Oracle DB successfully.
- [x] **UI Framework:** Initialize `shadcn/ui` and install core components: Button, Card, Table, Input, Dialog, Form, Badge, Avatar, DropdownMenu.

**Phase 2: Authentication & Identity (The Operator Logic)**
- [x] **Database Schema:** Create a SQL migration to create/update the `USERS` table (Columns: `email`, `google_name`, `operator_name`, `role`).
- [x] **Auth.js Setup:** Configure NextAuth v5 with Google Provider.
- [x] **Session Enrichment:** Customize the session callback to inject `operator_name` from the DB into the session object.
- [x] **Middleware:** Implement `middleware.ts` to protect dashboard routes.
- [x] **The "Gatekeeper" Page:** Create `app/onboarding/page.tsx`.
- [x] **Onboarding Logic:** Implement a Server Action that allows a user to set their `operator_name` ONLY if it is currently null.
- [x] **Redirect Logic:** Modify middleware to force users with `operator_name === null` to the onboarding page.

**Phase 3: The Dashboard (Read Layer)**
- [x] **Layout:** Create a sidebar layout with navigation and a user profile dropdown.
- [x] **KPI Cards:** Create a `StatsGrid` component to query and display: Total Leads, Emails Found, Phone Numbers Found, Success Rate.
- [x] **Data Table:** Implement a rich data table for the `PROFILES` table using TanStack Table (via shadcn).
- [x] **Filtering:** Add server-side filtering (by Date, by Operator, by Status).

**Phase 4: CRM Features (Write Layer)**
- [x] **Status Updates:** Allow users to change a prospect's status (e.g., "To Contact" -> "Contacted") directly from the table.
- [x] **Notes System:** Add a side sheet or modal to view/add notes for a specific profile.
- [x] **Operator Tagging:** Ensure every update made by a user is logged with their `operator_name` in the database.

**Phase 5: Polish & Deployment**
- [x] **Error Boundaries:** Add graceful error handling for DB timeouts.
- [x] **Loading States:** Add Skeleton loaders for the table and stats cards.
- [x] **Production Build:** Verify `npm run build` succeeds without type errors.
- [x] **Vercel Config:** Ensure `next.config.ts` is optimized for serverless deployment.
