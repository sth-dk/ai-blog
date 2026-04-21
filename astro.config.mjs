import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sth-dk.github.io',
  base: '/ai-blog',
  integrations: [mdx(), sitemap()],
});
