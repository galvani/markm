import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Neutralino serves the built frontend from documentRoot (/dist/) over its
// local server, so relative asset paths keep things robust regardless of how
// the runtime mounts the resources.
export default defineConfig({
  base: './',
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
  },
});
