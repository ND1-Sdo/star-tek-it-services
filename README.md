# Star-Tek IT Services

Marketing site for [Star-Tek IT Services](https://services.ltdstartek.org) — websites, apps, and IT management.

## Local development

```bash
npm run build
npx --yes serve dist
```

Open http://localhost:3000

Edit HTML/CSS/JS in the repo root, then rebuild.

## Build

```bash
npm run build
```

The build script:

- Validates all pages, internal links, and assets
- Copies the site into `dist/`
- Generates `sitemap.xml` and `robots.txt`

Optional: override the canonical origin for staging:

```bash
SITE_ORIGIN=https://services-ltdstartek-org.onrender.com npm run build
```

## Deploy (Render)

Connected repo: `ND1-Sdo/star-tek-it-services`

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |

`render.yaml` in this repo configures the build, cache headers, and security headers.

After deploy, add custom domain `services.ltdstartek.org` in Render → Settings → Custom Domains when ready.

## Structure

```
index.html          Home
services.html       Service listings
how-we-work.html    Process
our-work.html       Portfolio (case studies)
about.html          About
contact.html        Contact form (mailto)
privacy.html        Privacy policy
404.html            Not found page
css/styles.css      Liquid glass theme + Manrope
js/main.js          Nav, contact form, footer year
js/site-config.js   Site constants
scripts/build.mjs   Build + validation
```

## Contact

ltdstartek@gmail.com
