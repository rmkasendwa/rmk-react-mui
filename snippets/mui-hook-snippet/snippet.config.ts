import { readFileSync } from 'fs';

const txt = readFileSync(`${__dirname}/snippet.txt`, 'utf8');

export default {
  ['Mui Hook']: {
    scope: 'javascript,typescript,typescriptreact',
    prefix: 'muihook',
    body: [txt],
    description: 'Mui Hook',
  },
};
