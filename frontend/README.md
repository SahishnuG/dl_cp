# Karmafit Frontend

## Project Overview

Karmafit Frontend is a modern web application built with Next.js and TypeScript that provides an intuitive interface for resume analysis, candidate screening, and recruitment analytics. It displays comprehensive dashboards and detailed candidate reports powered by the GOT-OCR backend.

## Features

- **Dashboard Analytics**: View recruitment metrics including total resumes, strong fits, trainable candidates, and risky fits
- **Candidate Search**: Search and retrieve detailed information about candidates
- **Resume Analysis Charts**: Visualize resume processing statistics and candidate classifications
- **Detailed Reports**: Generate comprehensive candidate reports with strengths, weaknesses, and fit classifications
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Type-Safe Development**: Full TypeScript support with type checking

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts & Visualization**: Recharts 3.7.0
- **Linting**: ESLint 9
- **Node**: Latest LTS recommended

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

2. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. **Open in browser**: Navigate to [http://localhost:3000](http://localhost:3000) to see the application

## Development Guide

- **Editing Pages**: Modify files in the `app/` directory and the page will auto-update as you edit
- **Creating Components**: Add reusable components in the `components/` directory
- **Fonts**: This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) with the Geist font family

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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
