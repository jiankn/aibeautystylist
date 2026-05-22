import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://aibeautystylist.com',
  output: 'server',
  adapter: cloudflare(),
  vite: {
    server: {
      host: true,
    },
  },
});
