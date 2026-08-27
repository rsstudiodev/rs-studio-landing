import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import mdx from "@astrojs/mdx";
import reactI18next from 'astro-react-i18next';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://rs-studio.dev',

  integrations: [react(), sitemap(), partytown(),

  reactI18next({
    defaultLocale: "es-MX",
    locales: ["en-US", "es-MX"],
    namespaces: ['common', 'services']
  }),

  mdx(),
  ],

  markdown: {
    shikiConfig: { theme: "github-light", wrap: true },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@calcom/embed-react",
      ],
    },
  },

  adapter: cloudflare({
    prerenderEnvironment: 'node' 
  })
});