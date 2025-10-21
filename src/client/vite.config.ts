import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@game': path.resolve(__dirname, './game'),
        '@objects': path.resolve(__dirname, './game/objects'),
        '@scenes': path.resolve(__dirname, './game/scenes'),
      },
    },
    build: {
      outDir: '../../dist/client',
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
      ...(mode === 'production' && {
        minify: 'terser',
        terserOptions: {
          compress: {
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
      }),
    },
  };
});
