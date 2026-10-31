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

| Pair | Light | Dark |
| --- | --- | --- |
| foreground on background | 17.2 | 16.5 |
| muted-foreground on background | 5.8 | 7.7 |
| muted-foreground on muted | 5.4 | 6.8 |
| primary-foreground on primary | 5.1 | 7.6 |
| primary (as link text) on background | 5.2 | 7.7 |
| danger-foreground on danger | 5.2 | 6.6 |
| success-foreground on success | 5.0 | 8.0 |
| warning-foreground on warning | 7.1 | 9.2 |
| input border on background | 3.3 | 3.5 |

Re-check these pairs when you change a value; text needs ≥ 4.5, borders and icons ≥ 3.

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
`ring` and `accent*` to the brand's hue, then adjust lightness until the contrast table passes. Tint the neutrals by
changing their hue too, keeping chroma ≤ 0.015 so grays stay gray.

## Typography

- **Sans:** Inter (variable). **Mono:** JetBrains Mono (variable). Swap them per project by changing the font import;
  the tokens read `--bd-font-sans` / `--bd-font-mono`.
- Use Tailwind's type scale. A sensible default hierarchy:

| Role | Classes |
| --- | --- |
| Display / hero | `text-4xl sm:text-5xl font-semibold tracking-tight` |
| Page title (h1) | `text-3xl font-semibold tracking-tight` |
| Section (h2) | `text-2xl font-semibold` |
| Subsection (h3) | `text-lg font-medium` |
| Body | `text-base leading-7` |
| Small / caption | `text-sm text-muted-foreground` |

- Keep body text to `max-w-prose` (~65 characters per line).

## Spacing & layout

- Stick to Tailwind's 4px scale, preferring this subset: `1 2 3 4 6 8 12 16 24` (4–96px).
- Page container: `mx-auto w-full max-w-5xl px-4 sm:px-6`.
- Vertical rhythm between page sections: `py-16 sm:py-24`. Between items in a group: `gap-4` or `gap-6`.
- Mobile-first: write base styles for phones, then add `sm:`/`md:`/`lg:`.

## Shape & depth

- Radius: `rounded-md` for controls, `rounded-lg` for cards, `rounded-full` for pills/avatars.
- Prefer a `border` over a shadow. Use `shadow-sm` at most for floating elements (menus, dialogs).

## Components (patterns, not a library)

```html
<!-- Primary button -->
<button class="inline-flex h-10 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90">

<!-- Secondary button -->
<button class="inline-flex h-10 items-center rounded-md bg-secondary px-4 font-medium text-secondary-foreground hover:bg-accent">

<!-- Card -->
<div class="rounded-lg border bg-surface p-6 text-surface-foreground">

<!-- Text input -->
<input class="h-10 w-full rounded-md border border-input bg-background px-3 placeholder:text-muted-foreground">
```

Once a pattern shows up a third time, turn it into a component.

## Motion

- Short and subtle: `transition-colors duration-150` for hovers, ≤ 300ms for anything larger.
- Wrap non-essential animation in `motion-safe:`.
