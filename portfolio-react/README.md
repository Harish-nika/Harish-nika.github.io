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
Then deploy the built `dist` files to the repository publishing branch/folder.
