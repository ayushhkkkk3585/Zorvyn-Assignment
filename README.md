# Finance Dashboard UI - Newsprint Edition

Frontend assignment implementation built with Next.js App Router, TypeScript, Tailwind CSS v4, and Recharts.

## Overview

This project implements a single-page finance dashboard with a bold Newsprint visual style and assignment-aligned functionality:

- Dashboard summary cards (balance, income, expenses)
- Time-based visualization (monthly balance trend)
- Categorical visualization (expense breakdown by category)
- Transactions table with filtering, search, and sorting
- Simulated role-based UI (`viewer` and `admin`)
- Insights panel with spending observations and monthly comparison
- Loading, empty, and no-result states
- Responsive layout behavior across mobile/tablet/desktop

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## State Management Approach

State is managed in the page-level client component using React hooks:

- `transactions`: source records loaded via simulated async fetch
- `role`: `viewer` or `admin` toggle
- `query`, `typeFilter`, `sortBy`: UI controls for table exploration
- Derived state via `useMemo` for summary, trend data, categories, filtered table data, and insights

This keeps data flow explicit and easy to reason about for assignment scope.

## Mock API Simulation

Transactions are loaded asynchronously with a delayed Promise in `useEffect` to model API behavior and drive loading states.

## Requirement Mapping

1. Dashboard Overview
- Summary cards: total balance, income, expenses
- Time chart: monthly trend area chart
- Category chart: pie chart for expense distribution

2. Transactions Section
- Fields: date, amount, category, type, description
- Features: search, type filtering, and sorting

3. Basic Role Based UI
- Role switcher in header
- `viewer`: read-only
- `admin`: add transaction button enabled (demo interaction)

4. Insights Section
- Highest spending category
- Monthly net comparison insight
- Current spend-rate indicator

5. State Management
- React state + memoized selectors for clarity and predictable updates

6. UI and UX Expectations
- Clean responsive layout
- High-contrast visual hierarchy
- Graceful loading, empty, and no-match states

## Design System Notes

The Newsprint design system is implemented through centralized global tokens and utilities in `app/globals.css`:

- Color tokens (off-white paper, ink black, muted greys, editorial red)
- Typography families for display/body/UI/data
- Sharp-corner utility (zero radius)
- Newsprint textures and dot-grid background
- Flat interaction style with hard offset hover shadows

## Possible Enhancements

- Persist transactions and role in localStorage
- Add in-table editing modal for admin
- Add CSV/JSON export
- Add mock API route handler with pagination
