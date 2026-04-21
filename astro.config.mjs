import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chuanglian.github.io',
  base: '/ai-blog',
  integrations: [mdx(), sitemap()],
});
