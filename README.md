# FinTrak

Personal finance tracker for loans, bills, income, and savings with a calendar view.

**Live:** [fintrak.one](https://fintrak.one)

## Features

- **Loans** — Track balances, scheduled payments, and payment history
- **Bills** — Manage recurring expenses with flexible frequencies
- **Income** — Track recurring income sources
- **Savings** — Monitor savings account balances
- **Calendar** — View all financial obligations on a monthly/yearly calendar with drag-to-select range summaries
- **Dashboard** — Summary cards, donut chart with budget breakdown, and calendar in one view
- **Multi-currency** — Toggle between PHP and USD
- **Auth** — Email/password with session-based auth (Google OAuth ready)
- **Mobile** — Responsive layout with bottom tab navigation
- **PWA** — Installable as a progressive web app

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 with neo-brutalism design
- **Database:** Turso (SQLite-compatible)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** Session cookies + scrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) database

### Environment Variables

Create a `.env.local` file:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_URL=http://localhost:3000
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Database tables are created automatically on first run.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── api/            # REST API routes (auth, loans, bills, payments, savings)
│   ├── dashboard/      # Dashboard layout, page, and [section] routes
│   ├── login/          # Login/register page
│   ├── page.tsx        # Landing page
│   ├── layout.tsx      # Root layout with SEO metadata
│   ├── manifest.ts     # PWA manifest
│   ├── sitemap.ts      # Sitemap generation
│   └── robots.ts       # Robots.txt
├── components/         # React components
│   ├── Calendar.tsx         # Month/year calendar with drag selection
│   ├── CalendarDayCell.tsx  # Individual day cell with payment indicators
│   ├── DonutChart.tsx       # Budget breakdown donut chart
│   ├── LoanIndicator.tsx    # Payment pill in calendar cells
│   ├── PaymentDialog.tsx    # Record/undo payment modal
│   ├── LoanForm.tsx         # Add/edit loan form
│   ├── BillForm.tsx         # Add/edit bill form
│   ├── SavingsForm.tsx      # Add/edit savings form
│   ├── LoanList.tsx         # Loan list with payment progress
│   ├── BillList.tsx         # Bill list (expense/income)
│   └── SavingsList.tsx      # Savings account list
├── hooks/              # Custom React hooks
│   ├── useLoans.ts     # Loan CRUD + payments
│   ├── useBills.ts     # Bill CRUD + payments
│   └── useSavings.ts   # Savings CRUD
├── lib/                # Business logic & utilities
│   ├── db.ts           # Turso client + auto-migrations
│   ├── auth.ts         # Session management, password hashing
│   ├── oauth.ts        # Google OAuth flow
│   ├── currency.tsx    # Currency context (PHP/USD)
│   ├── payments.ts     # Loan payment schedule generation
│   ├── bill-schedule.ts # Bill payment schedule generation
│   ├── colors.ts       # Chart/indicator color palette
│   ├── types.ts        # TypeScript interfaces
│   └── rate-limit.ts   # Login rate limiting
└── proxy.ts            # Auth proxy (protects dashboard, redirects logged-in users)
```

## License

MIT
