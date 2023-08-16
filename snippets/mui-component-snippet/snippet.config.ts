import { readFileSync } from 'fs';

const txt = readFileSync(`${__dirname}/snippet.txt`, 'utf8');

export default {
  ['Mui React Component']: {
    scope: 'javascript,typescript,typescriptreact',
    prefix: 'muicomp',
    body: [txt],
    description: 'Mui React Component',
  },
};
