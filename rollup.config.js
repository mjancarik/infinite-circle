import nodeResolve from '@rollup/plugin-node-resolve';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import terser from 'rollup-plugin-terser';

const babelConfig = {
  babelrc: false,
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '12',
        },
        modules: false,
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: false },
      },
    ],
  ],
};

const env = process.env.NODE_ENV;
const config = {
  input: 'src/main.js',
  plugins: [getBabelOutputPlugin(babelConfig), nodeResolve()],
  external: 'easy-uid',
};

if (env === 'es' || env === 'cjs') {
  config.output = { format: env };
}

if (env === 'umd') {
  config.output = { format: 'umd', name: 'InfiniteCircle' };

  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  );
}

export default config;
