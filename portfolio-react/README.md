# Portfolio React App

This is the React migration of the portfolio site.

## Stack
- React + Vite
- Component-based sections (`App.jsx`)
- Static assets reused from the old portfolio under `public/assets/`

## Run locally

```bash
cd portfolio-react
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Output is generated in `dist/`.

## GitHub Pages support

Yes, GitHub Pages supports React (static build output).

For user pages (`https://harish-nika.github.io/`), keep Vite base as `/`.
Primary deployment path is now GitHub Actions with workflow:

- `.github/workflows/deploy-pages.yml` (builds `portfolio-react` and deploys `dist` to Pages)

## Deployment workflows

### Recommended (CI-based)

1. In repository Settings -> Pages, set Source to **GitHub Actions**.
2. Push to `main`.
3. Workflow automatically builds and deploys `portfolio-react/dist`.

### Temporary fallback (manual root sync)

If needed, this project still supports manual root sync:

```bash
cd portfolio-react
npm run deploy:root
```

This runs `../deploy-react-to-root.sh` and copies build output into repository root.
