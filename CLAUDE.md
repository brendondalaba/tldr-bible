@AGENTS.md

# Bible Sidekick

Astro + Tailwind CSS v4 + TypeScript, brought onto bd-style after the fact.

## Before you change anything

- Code conventions: `docs/CODE_STYLE.md`. UI and color rules: `docs/DESIGN.md`. Read the relevant one first.
- UI uses role colors from `src/styles/tokens.css` (`bg-primary`, `text-muted-foreground`, ...). Never raw hex,
  never Tailwind palette colors, never `dark:` classes; tokens already handle light and dark.

## Workflow

- npm only. After changes, run `npm run check` (Biome lint + type check) and fix what it reports.
- `npm run format` applies Biome's safe fixes and formatting. Don't hand-format.
- Keep changes small and focused. Commit messages use Conventional Commits (`feat: ...`, `fix: ...`).
- Ask before adding a dependency; prefer the platform or a few lines of code.

## Project notes

- Deployed on Netlify (bible-sidekick.netlify.app) from `main`. Node 22 via `.nvmrc`.
- Book summaries are Markdown in `src/content/bible/` (`NN-book-name.md`); the number prefix sets order and URL.
  Frontmatter `chapters` drives the tracker grid and must match `public.books` in Supabase.
- Reading tracker: `src/lib/progress.ts` (one shared store). Guests save to localStorage; signed-in readers
  (Google via Supabase Auth) sync to Supabase and guest progress is merged on sign-in.
- Database schema, RLS and functions live in `supabase/migrations/`. Change them with a new migration file,
  never by editing an applied one.
- Content is written from an Assemblies of God (Pentecostal) perspective.
- Genre badge colors are project tokens (`--genre-*`) in `tokens.css`; see the table in `docs/DESIGN.md`.
