# Portfolio React App

React + Vite shell around the original HTML portfolio. **Edit only this folder** (`portfolio-react/`). Do not patch copies in the GitHub Pages repo root.

Home page copy is **not** React components. `src/App.jsx` injects `src/legacy-portfolio.html`. Profile, resume PDF, and resume markdown come from a **second** source: `public/content/profile-data.json`.

## Quick “what do I edit?”

| I want to change… | Edit these files |
| --- | --- |
| Home, About, Experience, Skills, Projects, Certs, Contact, nav, footer | `src/legacy-portfolio.html` (search the section `id`) |
| Hero typewriter roles | `public/assets/js/main.js` (`roles` array) |
| Resume PDF, `resume.md`, or `profile.html` content | `public/content/profile-data.json`, then `npm run build:resume` |
| Resume PDF layout / page breaks | `scripts/generate-resume.mjs` |
| Full profile page chrome (buttons, colors) | `public/profile.html` |
| Case study page | matching `public/*.html` (see table below) |
| Photo, cert image, project screenshot | `public/assets/img/` (and HTML/`profile-data.json` paths) |
| Cert PDF download | `public/assets/certs/` + links in HTML and JSON |
| Home layout / certs / project cards look | `public/assets/css/portfolio-enhance.css` |
| Original Bedimcode theme (colors, header, skills accordion) | `public/assets/css/styles.css` |
| Page fade, Lottie wrappers | `src/App.css` + `src/App.jsx` |
| Lottie animation file | `public/assets/animations/lottie/` + `lottieConfig` in `src/App.jsx` |
| Site title / SEO / social preview | `index.html` (home) or the case-study / profile HTML `<head>` |
| Live site after push | `.github/workflows/deploy-pages.yml` builds this app on `main` |

**Keep home and resume in sync.** Changing a job, skill, project, or cert on the homepage does **not** update the resume. Edit `profile-data.json` too (or the other way around).

Do **not** hand-edit `public/content/resume.md` or `public/content/Harish-Kumar-Resume.pdf`. Both are generated.

## Home page sections (`src/legacy-portfolio.html`)

Search the `id=` below. Hash links use that id (`#experience`, `#Projects`, …).

| Section | `id` | What lives there |
| --- | --- | --- |
| Header / nav | `header` | Logo, menu, dark-mode button |
| Background chips | `.tech-rain-layer` | Floating AI/MLOps labels behind the hero |
| Home / hero | `home` | Photo (`assets/img/full_image.jfif`), title, description, Resume / Contact / Full Profile buttons |
| About | `about` | Cover image, bio, highlight bullets, year/project counts, LinkedIn / WhatsApp |
| Experience | `experience` | Academic (`#education`) and Professional (`#work`) timelines |
| Skills | `skills` | Accordion groups (Data Science & AI, Backend, Cloud, ETL, Analytics, DevOps) |
| Projects | `Projects` | Project cards (capital **P**) |
| Certifications | `Certifications` | Accomplishments tab `#cert-accomplishments`, Courses tab `#cert-courses` |
| Contact | `contact` | Pitch, email, location, phone |
| Footer | `.footer` | Name, links, GitHub / LinkedIn / email |

Related files for home behavior:

- `public/assets/js/main.js` — mobile nav, theme toggle, skills accordion, cert tabs + Swiper, typewriter
- `public/assets/js/portfolio-enhance.js` — image lightbox
- `src/App.jsx` — loads CSS/JS, Lottie, experience-tab animation swap, hash scroll

## Projects and case studies

Home cards: `src/legacy-portfolio.html` inside `#Projects`. Case studies are static HTML under `public/` (copied into `dist/` as-is).

| Project | Case study file | Typical images |
| --- | --- | --- |
| PAI PDF AI | `public/pai-pdf-ai.html` + `public/pai-animation/` | `public/assets/img/pai/` |
| Data Mining Engine (DME) | `public/dme-project.html` (home CTA is email request, not this URL) | `public/assets/img/dme/` |
| Recruiting Agent | `public/recruiting-agent.html` | `public/assets/img/recruiting-agent/` |
| Trip Guide | `public/trip-planner-agent.html` | — |
| Fixed Income Expert | `public/fexpert.html` | — |
| Content Moderator | `public/content-moderator.html` | `public/assets/img/content-moderator/` |
| Language tool | `public/lang-tool.html` | `public/assets/img/lang-tool/` |
| MedBot | `public/medbot.html` | `public/assets/img/medbot/` |
| Dental ML | `public/dental-project.html` | `public/assets/img/Dental_project/` |
| Disease prediction, AR viz, summarization, old ATS | no case study (mailto on the card) | — |

To add a project: duplicate a card in `#Projects`, add `public/<name>.html` if it needs a case study, put screenshots under `public/assets/img/<name>/`, add an entry in `profile-data.json` → `projects` (`resume: 1` is first on the PDF; omit `resume` to hide it from the PDF). If the case study should get the same nav helpers as the others, add the filename to `projectPageNames` in `src/App.jsx`.

## Certifications

Two places, two tabs:

1. **Home carousel** — `src/legacy-portfolio.html`
   - Accomplishments / awards / exam: `#cert-accomplishments` (class `js-cert-swiper-accomplishments`)
   - Courses: `#cert-courses` (class `js-cert-swiper-courses`)
   - Tab JS: `public/assets/js/main.js`
2. **Resume / profile list** — `public/content/profile-data.json` → `certifications`
   - `"kind": "accomplishment"` vs `"kind": "course"`

Assets:

- Photos / badges: `public/assets/img/` (optional 530px WebP in `public/assets/img/certs/`)
- Downloadable PDFs: `public/assets/certs/`

Copy an existing `swiper-slide` block when adding a card. Featured look uses `cert-card--featured` plus a `cert-kind` chip (`award` / `exam` / `externship`).

## Resume and full profile

```
public/content/profile-data.json
        ├── public/profile.html          (fetches JSON in the browser)
        └── scripts/generate-resume.mjs
                ├── public/content/resume.md
                └── public/content/Harish-Kumar-Resume.pdf
```

JSON keys: `basics`, `experience`, `education`, `skills`, `projects`, `certifications`.

Home Download Resume button points at `./content/Harish-Kumar-Resume.pdf`. After JSON edits, run `npm run build:resume` (also runs as part of `npm run build`).

## Styles and motion

| File | Use for |
| --- | --- |
| `public/assets/css/styles.css` | Base theme, layout, dark mode variables |
| `public/assets/css/portfolio-enhance.css` | Project cards, cert tabs, DME flows, extra polish |
| `src/App.css` | Wrapper, ~120ms content fade, section/experience transition classes |
| `public/assets/css/portfolio-transitions.css` | Unused overlay rules; keep the file so case studies do not 404 |
| `public/assets/js/portfolio-transitions.js` | Nav helpers (no overlay HUD) |
| `src/App.jsx` `lottieConfig` | Maps `data-lottie-id` slots in the HTML to JSON in `public/assets/animations/lottie/` |

## How the app is wired

```
index.html          Vite entry, home SEO
src/main.jsx        React mount
src/App.jsx         Injects HTML, loads /assets CSS+JS, Lottie
src/legacy-portfolio.html
public/             Static files served as-is (case studies, profile, assets, content)
```

`vite.config.js` keeps `base: '/'` for the user site `https://harish-nika.github.io/`.

## Run locally

Needs Node 20 (`npm ci --legacy-peer-deps` if peer warnings appear).

```bash
cd portfolio-react
npm install
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Case studies: `/dme-project.html`, `/profile.html`, etc.

```bash
npm run build:resume   # PDF + markdown only
npm run build          # resume + Vite → dist/
npm run preview
```

## Deploy

GitHub Actions [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml): push `main` → `npm run build` in this folder → deploy `portfolio-react/dist`.

Pages source must be **GitHub Actions**. Fallback (only if asked): `npm run deploy:root` copies `dist/` into the repo root.
