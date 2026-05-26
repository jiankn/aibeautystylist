import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aibeautystylist.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    server: {
      host: true,
      // 开发环境代理：绕过 workerd 沙盒的 outbound fetch 限制
      // Workers 内部的 fetch 请求 /dev-proxy/gemini/* 会被 Vite 转发到真实 API
      proxy: {
        '/dev-proxy/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/dev-proxy\/gemini/, ''),
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.error('[vite proxy error]', err.message);
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end(`Proxy error: ${err.message}`);
              }
            });
          },
        },
      },
    },
  },
});
