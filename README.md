# TLDR Bible 📖

A modern, interactive website that provides concise summaries of all 66 books of the Bible. Each book is presented with its key themes, important passages, and a digestible overview - perfect for quick reference or study.

## ✨ Features

- **Complete Coverage**: Summaries for all 66 books of the Bible (Old and New Testament)
- **Key Verses**: Each book features an inspirational verse displayed prominently on the page
- **Genre Color Coding (light and dark themes)**: Visual organization by biblical genre (Law, History, Wisdom, Prophecy, Gospels, Letters, etc.)
- **Comprehensive Content**: Overview, author, era, audience, historical context, purpose, themes, and structure for each book
- **Clean Design**: Modern, responsive interface built with Astro and Tailwind CSS
- **Fast Performance**: Static site generation for optimal loading speeds
- **Easy Navigation**: Browse all books from the home page, click to read detailed summaries

## 🚀 Project Structure

```text
/
├── public/                         # Static assets
├── src/
│   ├── content.config.ts           # Content collection (glob loader)
│   ├── content/bible/              # All 66 Bible book summaries (.md files)
│   ├── components/
│   │   ├── GenreBadge.astro        # Genre pill, colored by genre tokens
│   │   └── ThemeToggle.astro       # System → light → dark
│   ├── layouts/BaseLayout.astro    # Shared <head>, nav and footer
│   ├── lib/bookSections.ts         # Splits a book into "At a glance" + sections
│   ├── pages/
│   │   ├── index.astro             # Home page with book grid
│   │   ├── start-here.astro        # How to start reading the Bible
│   │   └── bible/[...slug].astro   # Book detail pages
│   └── styles/
│       ├── tokens.css              # Design tokens (bd-style), incl. genre colors
│       └── global.css              # Fonts + Markdown article styles
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## � Content Structure

Each Bible book summary includes:
- **Title & Description**: Clear identification and thematic summary
- **Key Verse**: An inspirational verse from the book
- **Overview**: Core message and significance
- **Author & Era**: Historical context and dating
- **Audience**: Original and modern readers
- **Purpose**: Why the book was written
- **Genre**: Literary style and type
- **Key Themes**: Major theological and narrative themes
- **Structure**: Book outline and organization

## 🛠️ Tech Stack

- **[Astro](https://astro.build)**: Static site framework
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **Content Collections**: Type-safe markdown content management
