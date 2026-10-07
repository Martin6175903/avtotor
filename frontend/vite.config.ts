import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr({
      include: '**/*.svg?react',
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  resolve: {
    alias: {
      '@assets': path.resolve(import.meta.dirname, 'src/assets'),
      '@components': path.resolve(import.meta.dirname, 'src/components'),
      '@hooks': path.resolve(import.meta.dirname, 'src/hooks'),
      '@modules': path.resolve(import.meta.dirname, 'src/modules'),
      '@services': path.resolve(import.meta.dirname, 'src/services'),
      '@types': path.resolve(import.meta.dirname, 'src/types'),
      '@utils': path.resolve(import.meta.dirname, 'src/utils'),
    },
  },
});
