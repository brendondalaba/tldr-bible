# Design system

A neutral base meant to be re-skinned per project. All values live in `src/styles/tokens.css`.

## Rules

1. **Use role colors only:** `bg-primary`, `text-muted-foreground`, `border-border`, and so on. Never raw hex/oklch
   in components and never Tailwind palette colors (`bg-blue-600`, `text-gray-500`).
2. **Don't write `dark:` classes.** Each token already holds its light and dark value, so `bg-surface` is right in
   both themes. If something truly differs by theme, add a token instead. The `dark:` variant exists for rare
   escape hatches.
3. **Pair every fill with its `-foreground`:** text on `bg-primary` is `text-primary-foreground`, on `bg-danger` it's
   `text-danger-foreground`.
4. **To re-skin a project, edit `tokens.css` only.** If you're tempted to override a color in a component, the
   token set is missing something.

## Color roles

| Token | Use for |
| --- | --- |
| `background` / `foreground` | Page background and body text |
| `surface` / `surface-foreground` | Cards, panels, popovers (sit on top of `background`) |
| `muted` / `muted-foreground` | Subtle fills; secondary text, captions, placeholders |
| `border` | Dividers, card outlines (decorative; applied to all elements by default) |
| `input` | Form-control borders (meets 3:1 non-text contrast) |
| `ring` | Focus outlines (applied to `:focus-visible` globally) |
| `primary` / `primary-foreground` | Main call to action, links, active states |
| `secondary` / `secondary-foreground` | Secondary buttons, quiet controls |
| `accent` / `accent-foreground` | Hover/selected backgrounds, highlights, badges |
| `success` / `warning` / `danger` (+ `-foreground`) | Status messages, validation, destructive actions |

The default palette is a cool neutral gray with a blue primary (hue 255). Checked contrast (WCAG 2.x):

<!-- contrast:start -->
| Pair | Light | Dark |
| --- | --- | --- |
| foreground on background | 17.20 | 16.52 |
| foreground on surface | 17.66 | 15.29 |
| muted-foreground on background | 5.81 | 7.66 |
| muted-foreground on muted | 5.41 | 6.80 |
| muted-foreground on surface | 5.97 | 7.10 |
| primary-foreground on primary | 5.10 | 7.57 |
| primary (as link text) on background | 5.19 | 7.68 |
| secondary-foreground on secondary | 13.86 | 11.87 |
| accent-foreground on accent | 8.09 | 9.55 |
| success-foreground on success | 4.99 | 8.02 |
| warning-foreground on warning | 7.06 | 9.14 |
| danger-foreground on danger | 5.15 | 6.58 |
| danger (as error text) on background | 5.24 | 6.63 |
| input border on background | 3.26 | 3.48 |
| focus ring on background | 4.20 | 7.68 |
<!-- contrast:end -->

Text needs ≥ 4.5, borders and focus rings ≥ 3. Don't edit this table by hand: `npm run contrast -- --write`
(from the bd-style repo, or `node <bd-style>/scripts/contrast.mjs . --write` in a project) checks every pair and
regenerates it. The pairs it checks are listed in `scripts/lib/contrast-pairs.json`.

### Project tokens: genre badges

Used by `GenreBadge.astro` (`bg-genre-law text-genre-law-foreground`, and so on). Each fill is paired with its
`-foreground`; light fills take near-white text and dark-theme fills take near-black text.

| Genre | Light | Dark |
| --- | --- | --- |
| Law | 7.1 | 9.4 |
| History | 5.6 | 9.1 |
| Wisdom | 5.7 | 9.5 |
| Prophecy | 6.2 | 9.1 |
| Gospel | 5.5 | 10.5 |
| Epistle | 10.1 | 11.9 |
| Apocalyptic | 5.8 | 8.3 |

### Re-skinning quickly

Most projects only need a new brand hue. In `tokens.css`, change the hue (the last number, `255`) on `primary`,
`ring` and `accent*` to the brand's hue, then adjust lightness until the contrast check passes. Tint the neutrals by
changing their hue too, keeping chroma ≤ 0.015 so grays stay gray.

## Typography

- **Sans:** Inter (variable). **Mono:** JetBrains Mono (variable). Swap them per project by changing the font import;
  the tokens read `--bd-font-sans` / `--bd-font-mono`.
- Use Tailwind's type scale. Sizing follows shadcn/ui: compact, with `text-sm` as the default for anything inside
  the UI (controls, cards, tables, menus). Save `text-base` for long-form reading.

| Role | Classes |
| --- | --- |
| Display / hero | `text-4xl font-semibold tracking-tight text-balance lg:text-5xl` |
| Page title (h1) | `text-2xl font-semibold tracking-tight` |
| Section (h2) | `text-xl font-semibold tracking-tight` |
| Card title (h3) | `font-semibold leading-none` |
| UI text | `text-sm` |
| Prose | `text-base leading-7` |
| Description | `text-sm text-muted-foreground` |
| Label | `text-sm font-medium leading-none` |
| Fine print | `text-xs text-muted-foreground` |

- Keep body text to `max-w-prose` (~65 characters per line).

## Sizing

Controls share one height per size so they line up in a row.

| Control | Small | Default | Large |
| --- | --- | --- | --- |
| Button | `h-8 gap-1.5 px-3` | `h-9 gap-2 px-4` | `h-10 px-6` |
| Icon button | `size-8` | `size-9` | `size-10` |
| Input / select | | `h-9 px-3 py-1` | |
| Icons inside controls | `size-4` | `size-4` | `size-4` |

Inputs use `text-base md:text-sm`: 16px on phones stops iOS from zooming in on focus.

## Spacing & layout

- Stick to Tailwind's 4px scale, preferring this subset: `1 1.5 2 3 4 6 8 12 16` (4–64px).
- Page container: `mx-auto w-full max-w-5xl px-4 sm:px-6`.
- Between page sections: `py-12 sm:py-16`. Inside a card: `p-6` with `gap-6` between header, content and
  footer. Between form fields: `gap-6`; label to input: `gap-2`. Between items in a group: `gap-2` or `gap-4`.
- Mobile-first: write base styles for phones, then add `sm:`/`md:`/`lg:`.

## Shape & depth

- One base radius, `--radius` in `tokens.css` (0.625rem), drives the scale: `rounded-sm` 6px, `rounded-md` 8px,
  `rounded-lg` 10px, `rounded-xl` 14px. Change `--radius` to make a project rounder or sharper.
- `rounded-md` for buttons, inputs and badges; `rounded-lg` for alerts and popovers; `rounded-xl` for cards and
  dialogs; `rounded-full` for avatars and pills.
- Prefer a `border` over a shadow. Use `shadow-sm` at most for floating elements (menus, dialogs).

## Components (patterns, not a library)

```html
<!-- Button (default size). Swap the last group for a variant below. -->
<button class="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 font-medium text-sm whitespace-nowrap
  transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50
  bg-primary text-primary-foreground hover:bg-primary/90">
<!--   secondary: bg-secondary text-secondary-foreground hover:bg-accent
       outline:   border border-input bg-background hover:bg-accent hover:text-accent-foreground
       ghost:     hover:bg-accent hover:text-accent-foreground
       danger:    bg-danger text-danger-foreground hover:bg-danger/90 -->

<!-- Card -->
<div class="flex flex-col gap-6 rounded-xl border bg-surface p-6 text-surface-foreground">
  <div class="grid gap-1.5">
    <h3 class="font-semibold leading-none">Title</h3>
    <p class="text-muted-foreground text-sm">Description</p>
  </div>
</div>

<!-- Field -->
<div class="grid gap-2">
  <label class="font-medium text-sm leading-none">Email</label>
  <input class="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base
    placeholder:text-muted-foreground md:text-sm aria-invalid:border-danger">
</div>

<!-- Textarea -->
<textarea class="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm">

<!-- Badge -->
<span class="inline-flex items-center rounded-md border border-transparent bg-primary px-2 py-0.5 font-medium
  text-primary-foreground text-xs">

<!-- Alert (status fills: bg-success / bg-warning / bg-danger with their -foreground) -->
<div role="alert" class="rounded-lg px-4 py-3 text-sm bg-danger text-danger-foreground">
```

Once a pattern shows up a third time, turn it into a component.

## Motion

- Short and subtle: `transition-colors duration-150` for hovers, ≤ 300ms for anything larger.
- Wrap non-essential animation in `motion-safe:`.
