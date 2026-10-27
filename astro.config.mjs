// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// The deploy workflow (.github/workflows/deploy.yml) sets SITE_URL and BASE_PATH
// from GitHub Pages, so the same code works on username.github.io/repo-name/
// and on a custom domain. Locally both fall back to sensible defaults.
const site = process.env.SITE_URL || 'https://example.github.io'; // TODO: your final URL
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
