import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.mjs'],
  clean: true,
  minify: true,
  target: 'es2022',
  format: ['esm', 'cjs'],
  treeshake: true,
  shims: false,
  dts: true,
});
