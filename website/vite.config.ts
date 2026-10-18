import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  build: { target: 'es2022', rollupOptions: { output: { manualChunks: { three: ['three'], motion: ['gsap', 'gsap/ScrollTrigger'] } } } },
  server: { port: 4173, strictPort: true }, preview: { port: 4173, strictPort: true }
});
