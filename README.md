# Norweska Gramatyka

Static site built from CodeKit-style `.kit` partials.

Editable source files live in `src/`. The repository root is still the static publish directory.

## Layout

- `src/kit/` contains the Kit templates and partials.
- `src/styles/` contains editable CSS.
- `src/scripts/` contains editable JavaScript.
- root-level HTML, CSS, minified JavaScript, images, icons, and `CNAME` are the static publish output.
- `legacy/codekit/` keeps the old CodeKit configuration for reference only.

## Build

```sh
npm install
npm run build
```

The build keeps the existing output filenames:

- `src/kit/index.kit` -> `index.html`
- `src/styles/norweskagramatyka.css` -> `norweskagramatyka.css`
- `src/scripts/norweskagramatyka.js` -> `norweskagramatyka-min.js`

## Development

```sh
npm run dev
```

This watches `.kit` and JavaScript files, rebuilds on changes, and serves the site with Vite.
