import { defineConfig } from 'astro/config';
import { briefHonestyRemark } from './src/lib/brief-honesty-remark.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://greatindiancompany.com',
  markdown: {
    remarkPlugins: [briefHonestyRemark],
  },
});
