# 🚀 Liftoff

Your all-in-one cockpit for a focused 6-month sprint toward a developer role.
Liftoff brings tasks, deep-focus timing, idea capture, and your long-horizon
roadmap into a single, premium Notion-style workspace.

## Modules

- **Dashboard** — today at a glance: focus tasks, streak, daily log, countdown to
  your goal, and quick idea capture.
- **Tasks** — a full task manager with priorities, statuses (to do / in progress /
  done), categories, estimates, and due dates.
- **Focus** — a Pomodoro timer with focus / short break / long break cycles, round
  tracking, and automatic session logging into your stats.
- **Brain Dump** — a quick-capture inbox for fleeting ideas (convert any idea
  straight into a task) plus a notes area for longer writing.
- **Roadmap** — your phased 6-month plan. Paste any plan as text and Liftoff
  parses it into structured phases → weeks → tasks (Import roadmap).
- **Stats** — streaks, roadmap progress, focus time, momentum and consistency
  charts, and manual counters.

## Tech

- React 19 + TypeScript + Vite
- Tailwind CSS with a token-driven, dark-first design system (light mode included)
- Zustand for state, with debounced cloud sync to Supabase (pseudonymous device ID)
- Recharts, lucide-react, date-fns, PWA support

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

### Environment

Create `.env.local` for cloud sync (optional — the app runs locally without it):

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Supabase table `user_data` should have columns `id` (text, primary key),
`data` (jsonb), and `updated_at` (timestamp).

## On the horizon

- **Goal drift detection** — surface when daily work is drifting from the roadmap.
