# Zayon Studios

Portfolio website for Zayon Creative Studios. Static site, no build step. Everything Vercel serves lives in `dist/`.

## Structure

- `dist/index.html` is the page shell. `dist/app.js` draws each page from the data files.
- `dist/data.js` and `dist/project-extensions.js` hold the project text, captions and image lists. Contact details are in the `profile` object at the top of `data.js`.
- `dist/project-outcomes.js`, `dist/curated.js` and `dist/all-projects.js` combine and curate the project list.
- `dist/assets/` holds every image, the logo, favicon and the DM Sans font.
- Each route (`work/`, `about/`, `contact/` and every project under `work/<slug>/`) has its own copy of `index.html`, so every URL loads directly on any static host.

## Deploy

`vercel.json` points Vercel at `dist/` with no build or install step. Import the repo in Vercel and deploy with the defaults.

## Preview locally

The pages use JavaScript modules, so serve the folder rather than opening the file:

```bash
npx serve dist
```

## Notes

- Paths are root-relative (`/style.css`, `/assets/...`), so serve the site from the root of a domain or subdomain.
- The contact form prepares a draft and opens email or WhatsApp. It has no backend.
