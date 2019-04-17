import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import builtins from 'rollup-plugin-node-builtins';

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  globalScript: 'src/global/app.ts',
  plugins: [    
    sass(),
    builtins()
  ],
  outputTargets: [
    {
      type: 'www',
      // uncomment the following line to disable service workers in production
      // serviceWorker: null
    }
  ]
};
