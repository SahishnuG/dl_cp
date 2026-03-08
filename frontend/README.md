# Karmafit Frontend

## Project Overview

Karmafit Frontend is a modern web application built with Next.js and TypeScript that provides an intuitive interface for resume analysis, candidate screening, and recruitment analytics. It displays comprehensive dashboards and detailed candidate reports powered by the advanced deep learning backend.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page (redirects to dashboard)
│   ├── layout.tsx            # Root layout component
│   ├── globals.css           # Global styles
│   ├── candidates/
│   │   └── page.tsx          # Candidates listing page
│   └── dashboard/
│       └── page.tsx          # Dashboard analytics page
├── components/
│   ├── Navbar.tsx            # Navigation bar component
│   ├── DashboardStats.tsx    # Dashboard statistics cards
│   ├── ResumeChart.tsx       # Resume analysis chart
│   ├── CandidateSearch.tsx   # Candidate search component
│   └── CandidateReport.tsx   # Detailed candidate report component
├── public/                   # Static assets
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ or npm/yarn/pnpm package manager

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Set env vars**:  
   Create a ```.env.local``` file in frontend/ with the following format:
   ```bash
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in browser**: Navigate to [http://localhost:3000](http://localhost:3000) to see the application

## Building for Production

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Official Next.js documentation
- [React Documentation](https://react.dev) - Learn React
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - TypeScript reference
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Recharts Documentation](https://recharts.org) - Composable charting library

## Deployment

The frontend is hosted on https://dl-cp.vercel.app/ and uses a persistent ngrok url for backend api calls
