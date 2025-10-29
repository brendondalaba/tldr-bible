# TLDR Bible 📖

A modern, interactive website that provides concise summaries of all 66 books of the Bible. Each book is presented with its key themes, important passages, and a digestible overview - perfect for quick reference or study.

## ✨ Features

- **Complete Coverage**: Summaries for all 66 books of the Bible (Old and New Testament)
- **Genre Color Coding**: Visual organization by biblical genre (Law, History, Wisdom, Prophecy, Gospels, Letters, etc.)
- **Clean Design**: Modern, responsive interface built with Astro
- **Fast Performance**: Static site generation for optimal loading speeds
- **Easy Navigation**: Browse all books from the home page, click to read detailed summaries

## 🚀 Project Structure

```text
/
├── public/              # Static assets
├── src/
│   ├── content/
│   │   ├── config.ts   # Content collection configuration
│   │   └── bible/      # All 66 Bible book summaries (.md files)
│   ├── pages/
│   │   ├── index.astro           # Home page with book grid
│   │   └── bible/[...slug].astro # Dynamic book detail pages
│   ├── styles/
│   │   └── global.css            # Global styles
│   └── utils/
│       └── genreColors.ts        # Genre color scheme utilities
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

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
