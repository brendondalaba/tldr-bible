# Code style

The bd conventions for TypeScript web projects. Biome enforces formatting and most lint rules automatically; this
file covers what a tool can't.

## Tooling

| Task | Command |
| --- | --- |
| Lint + format check | `npm run lint` |
| Fix everything fixable | `npm run format` |
| Full check (lint + types) | `npm run check` |

- **Formatter/linter:** Biome (`biome.json`). No ESLint or Prettier.
- **Package manager:** npm. Commit `package-lock.json`.
- **TypeScript:** `strict` on. Don't loosen it per file.
- Run `npm run check` before every commit.

## Formatting (enforced by Biome)

- 2-space indent, LF line endings, 80-column lines.
- Double quotes, semicolons, trailing commas where ES5 allows, `x => x` (no parens on single arrow params).
- Imports are sorted automatically. Use `import type` for type-only imports.
- Tailwind classes are sorted automatically (`useSortedClasses`).

## TypeScript

- Use `type` for object shapes and unions. Reach for `interface` only when you need declaration merging.
- No `any`. Use `unknown` and narrow it. No non-null `!` unless a comment explains why it's safe.
- Let inference work for locals; annotate function parameters and exported return types.
- Validate data at the edges (forms, API responses, env vars), then trust the types inside.
- Prefer `const`, early returns, and small pure functions over flags and nested conditionals.

## Naming

| Thing | Style | Example |
| --- | --- | --- |
| Variables, functions | camelCase | `formatPrice` |
| Types, React/Astro components | PascalCase | `PriceTag` |
| Constants that never change | SCREAMING_SNAKE | `MAX_UPLOAD_MB` |
| Booleans | `is`/`has`/`can` prefix | `isOpen` |
| Event handlers | `handle` + event | `handleSubmit` |
| Next.js files | kebab-case | `price-tag.tsx` |
| Astro components | PascalCase | `PriceTag.astro` |

## Project structure

```
src/
  app/ or pages/   routes only; keep them thin
  components/      reusable UI
  lib/             framework-agnostic helpers, data access, utils
  styles/          tokens.css (+ global.css in Astro)
docs/              CODE_STYLE.md, DESIGN.md, plus project notes
```

- Import with the `@/` alias (`@/components/...`) instead of long `../../` chains.
- Use named exports. Use default exports only where the framework requires them (Next pages/layouts, config files).
- Colocate: a component's helpers live next to it until a second place needs them; then move them to `lib/`.

## Comments

- Explain *why*, not *what*. If the code needs a *what* comment, rename things until it doesn't.
- `TODO(bd): ...` for follow-ups, so they're searchable.

## Git

- Default branch `main`. Branch names: `feat/short-name`, `fix/short-name`, `chore/...`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat: add contact form`, `fix(nav): close menu on route change`, `chore: bump next`.
  Present tense, lowercase, no trailing period, subject ≤ 72 characters.
- One logical change per commit. Don't commit `.env` files; document required vars in `.env.example`.

## Accessibility & quality floor

- Semantic HTML first (`button`, `nav`, `main`, `label`). A `div` with `onClick` is a bug.
- Every image has `alt` (empty `alt=""` if decorative). Every input has a label.
- Keyboard: everything clickable is reachable and visibly focused.
- Respect `prefers-reduced-motion` for anything that animates.
