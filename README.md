# Code to Text Converter

Paste a code snippet, get it back as syntax-highlighted rich text you can paste into docs with the plain-text version copied alongside it for anywhere rich formatting isn't supported.

**Live at:** [code-to-text-converter.vercel.app](https://code-to-text-converter.vercel.app/)

## Features

- Syntax highlighting via [Shiki](https://shiki.style/) (Monokai theme)
- Auto-detects the language from pasted content, or pick one manually from the dropdown
- Copies both rich HTML and plain text to the clipboard in one click
- Light/dark theme, following your system preference by default

## Supported languages

HTML, CSS, JavaScript, TypeScript, JSX, TSX, HTML+JS (mixed markup and bare JS statements, e.g. DOM-manipulation snippets), JSON, Bash, Python, Java, Markdown, Docker, XML, Properties, Kotlin, YAML, SQL

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the development server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
