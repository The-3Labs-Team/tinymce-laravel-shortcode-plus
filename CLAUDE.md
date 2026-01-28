# CLAUDE.md

## Project overview

TinyMCE plugin collection for Laravel applications. Each plugin provides shortcode preview and editing capabilities inside the TinyMCE rich-text editor.

- **No build step** — raw JS files in `src/` are served directly via jsDelivr CDN from the GitHub `main` branch
- **Global dependency**: `tinymce` (provided by the host Laravel application)
- Every `src/*.js` file must be valid standalone browser JavaScript

## Commands

```bash
npm run start   # Local dev server on port 8080 (http-server)
npm run lint    # ESLint with auto-fix: npx eslint . --fix
```

There is no test suite. Verify changes manually in a TinyMCE editor instance.

## Architecture

Each `src/*.js` file is an independent TinyMCE plugin that self-registers via `tinymce.PluginManager.add()`.

**`preview.js`** is the central orchestrator — it handles event listening, shortcode-to-preview conversion, and exposes shared utility functions. Changes to `preview.js` affect all shortcode plugins.

Two factory functions in `preview.js` eliminate repetitive parser code:
- `createSocialParser()` — generates parsers for social embed shortcodes
- `createPlaceholderParser()` — generates parsers for placeholder-style shortcodes

### Plugin flow

1. User clicks toolbar button
2. `editor.windowManager.open()` shows a dialog
3. Dialog submits → `editor.insertContent('[shortcode ...]')`
4. `editor.execCommand('showPreview')` renders the in-editor preview

## Plugin categories (22 files)

| Category | Plugins |
|---|---|
| **Social embeds** (8) | `bluesky`, `facebook`, `instagram`, `reddit`, `tiktok`, `twitter`, `youtube`, `tmdb` |
| **Content blocks** (7) | `button`, `distico`, `faq`, `leggianche`, `spoiler`, `survey`, `trivia` |
| **Media / products** (3) | `mediahubPhoto`, `product`, `searchPublicApi` |
| **Utilities** (4) | `preview`, `index`, `shortcodeList`, `widgetbay` |

## Coding conventions

- **ESLint `standard` config** — no semicolons, single quotes, 2-space indent
- `/* global tinymce */` at the top of every plugin file
- `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants
- Template literals for HTML strings
- Section headers: `// ===== SECTION NAME =====`
- Comments in Italian or English (mixed)
- Space before function parentheses: `function foo (bar)` (standard style)

## Key patterns

### Plugin registration

```js
tinymce.PluginManager.add('pluginName', function (editor, url) {
  // ...
})
```

### Shortcode attribute extraction

```js
getShortcodeAttr(shortcode, 'attrName', defaultValue)
getShortcodeAttrs(shortcode, defaultsObject)
```

### XSS prevention

Always use `escapeHtml()` before inserting text into HTML. Use `sanitizeUrl()` for URLs.

### Entity decoding

`decodeHtmlEntities()` at the extraction layer (textarea-based browser decode).

### Preview element creation

```js
createPreviewElement(name, shortcode, html)
```

Wraps preview HTML in a `<span>` with `data-preview-shortcode` attributes.

### Async patterns

`parsePhoto()` in `mediahubPhoto.js` uses `Promise.all()` for parallel image loading.

## Server dependencies

| Endpoint | Purpose |
|---|---|
| `/ads-post-parser/get-preview-html` | Ad preview parsing |
| `/nova-vendor/media-hub/media/{id}/data` | MediaHub image API |
| TMDB external API | Movie/TV data (configured via editor settings) |

## CI/CD

- **GitHub Actions: Lint** — runs ESLint on every PR and push (`lint.yml`)
- **GitHub Actions: Flush Cache** — purges jsDelivr CDN cache on release (`purge-cdn.yml`)
- **Distribution**: jsDelivr CDN serves `src/*.js` directly from the `main` branch

## Important warnings

- **No bundler** — every `src/*.js` must be valid standalone browser JS (no import/export, no Node APIs)
- **No test suite** — verify changes manually in a TinyMCE editor
- **`preview.js` is critical** — it is loaded by all plugins; changes there affect every shortcode
- **Pre-existing lint errors** exist in `mediahubPhoto.js`, `survey.js`, `trivia.js`, `widgetbay.js` — do not introduce new ones
