# Chandan Kumar — Portfolio

A responsive portfolio built with React, TypeScript, Vite, and CSS. The content is intentionally honest about current learning: projects, certificates, email, and school details are not shown as real until Chandan adds them.

## Run locally

Install [Node.js](https://nodejs.org/) 20.19+ or 22.12+, then run these commands from the project folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview the production build:

```bash
npm run build
npm run preview
```

## Personalise the portfolio

- Edit the portfolio copy and learning topics in `src/App.tsx`.
- Edit colors, typography, themes, and responsive layouts in `src/style.css`.
- The Resume section links to Chandan's Google Docs resume. Confirm its sharing settings allow the intended audience to open it before publishing the site.
- Add project cards only for projects that exist. Include a live-demo link only when it is available.
- Add an email address only after Chandan chooses one to publish.

## GitHub Pages deployment

This repository is already configured as `chandan-personal-workspace`. Vite uses `/chandan-personal-workspace/` as its production base path, and `.github/workflows/deploy.yml` builds and deploys the static site when changes are pushed to `main`.

To enable deployment, open the repository on GitHub, go to **Settings → Pages**, and choose **GitHub Actions** as the build and deployment source. Then, after reviewing the files and deciding to publish, push the desired commit to `main`. The first workflow run may take a few minutes. The site is not considered live until that workflow succeeds and GitHub Pages shows the deployed URL.

No push or deployment has been performed as part of this setup.