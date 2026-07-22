# Deployment

## GitHub Pages

This project is a Vite app. GitHub Pages must not publish the repository root.

Required repository setting:

- Settings -> Pages -> Source: `GitHub Actions`

The workflow `.github/workflows/pages.yml` builds the app with Bun and uploads `dist/` through the official GitHub Pages artifact flow.

The old upstream deployment flow that pushed to `arcomage/arcomage.github.io` has been removed.

## Why Root Publishing Fails

The repository root contains Vite source files. Serving it directly exposes development-only paths such as `/src/index.tsx` and can leave template tokens or source asset paths unresolved.

The browser-ready output is produced only after:

```sh
bun install
bun run build
```

The generated `dist/` directory is the deployable website.

## Current Project URL

The Pages workflow builds with:

```sh
APP_URL=https://wildustrek.github.io/arcos/
```

If the repository owner or repository name changes, update this value in `.github/workflows/pages.yml`.
