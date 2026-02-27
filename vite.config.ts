import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // 项目包含1200+种材质定义，单包体积较大属预期行为
    chunkSizeWarningLimit: 2000,
  },
});
