#!/usr/bin/env node
/**
 * Star-Tek IT Services — static site build
 * Copies source to dist/, generates sitemap + robots.txt, validates assets.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const validateOnly = process.argv.includes("--validate-only");

const SITE_ORIGIN = (
  process.env.SITE_ORIGIN || "https://services.ltdstartek.org"
).replace(/\/$/, "");

const PAGES = [
  { path: "/", file: "index.html", changefreq: "weekly", priority: "1.0" },
  { path: "/services.html", file: "services.html", changefreq: "monthly", priority: "0.9" },
  { path: "/how-we-work.html", file: "how-we-work.html", changefreq: "monthly", priority: "0.8" },
  { path: "/our-work.html", file: "our-work.html", changefreq: "monthly", priority: "0.8" },
  { path: "/about.html", file: "about.html", changefreq: "monthly", priority: "0.7" },
  { path: "/contact.html", file: "contact.html", changefreq: "monthly", priority: "0.9" },
  { path: "/privacy.html", file: "privacy.html", changefreq: "yearly", priority: "0.3" },
];

const COPY_DIRS = ["css", "js", "images"];
const COPY_FILES = ["icons.svg"];

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function collectHtmlFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join(dir, name));
}

function resolveInternalAsset(baseDir, href) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("http") ||
    href.startsWith("data:")
  ) {
    return null;
  }
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return null;
  return path.normalize(path.join(baseDir, clean));
}

function validateSite(sourceDir) {
  const errors = [];
  const htmlFiles = collectHtmlFiles(sourceDir);

  for (const page of PAGES) {
    const filePath = path.join(sourceDir, page.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing page: ${page.file}`);
    }
  }

  if (!fs.existsSync(path.join(sourceDir, "404.html"))) {
    errors.push("Missing 404.html");
  }

  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, "utf8");
    const rel = path.relative(sourceDir, htmlPath);

    if (!/<title>[^<]+<\/title>/.test(html)) {
      errors.push(`${rel}: missing <title>`);
    }
    if (!/name="description"/.test(html)) {
      errors.push(`${rel}: missing meta description`);
    }
    if (!/<main[^>]*id="main-content"/.test(html)) {
      errors.push(`${rel}: missing main#main-content`);
    }

    const refs = [
      ...html.matchAll(/(?:href|src)="([^"]+)"/g),
    ].map((m) => m[1]);

    for (const ref of refs) {
      const resolved = resolveInternalAsset(path.dirname(htmlPath), ref);
      if (resolved && !fs.existsSync(resolved)) {
        errors.push(`${rel}: broken reference "${ref}"`);
      }
    }
  }

  for (const dir of COPY_DIRS) {
    if (!fs.existsSync(path.join(sourceDir, dir))) {
      errors.push(`Missing directory: ${dir}/`);
    }
  }

  for (const file of COPY_FILES) {
    if (!fs.existsSync(path.join(sourceDir, file))) {
      errors.push(`Missing file: ${file}`);
    }
  }

  return errors;
}

function writeSitemap(outDir) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(
    (page) => `  <url>
    <loc>${SITE_ORIGIN}${page.path === "/" ? "/" : page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
}

function writeRobots(outDir) {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
}

function build() {
  console.log("Star-Tek build — origin:", SITE_ORIGIN);

  const errors = validateSite(ROOT);
  if (errors.length) {
    console.error("Validation failed:\n" + errors.map((e) => "  • " + e).join("\n"));
    process.exit(1);
  }
  console.log("✓ Source validation passed");

  if (validateOnly) {
    console.log("Validate-only mode — skipping dist output.");
    return;
  }

  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  for (const html of collectHtmlFiles(ROOT)) {
    fs.copyFileSync(html, path.join(DIST, path.basename(html)));
  }

  for (const dir of COPY_DIRS) {
    copyDir(path.join(ROOT, dir), path.join(DIST, dir));
  }

  for (const file of COPY_FILES) {
    fs.copyFileSync(path.join(ROOT, file), path.join(DIST, file));
  }

  writeSitemap(DIST);
  writeRobots(DIST);

  const distErrors = validateSite(DIST);
  if (distErrors.length) {
    console.error("Dist validation failed:\n" + distErrors.map((e) => "  • " + e).join("\n"));
    process.exit(1);
  }

  console.log("✓ Built to dist/");
}

build();
