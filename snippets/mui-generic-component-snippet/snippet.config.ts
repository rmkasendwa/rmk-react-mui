import { readFileSync } from 'fs';

const txt = readFileSync(`${__dirname}/snippet.txt`, 'utf8');

export default {
  ['Mui Generic React Component']: {
    scope: 'javascript,typescript,typescriptreact',
    prefix: 'muigcomp',
    body: [txt],
    description: 'Mui Generic React Component',
  },
};
