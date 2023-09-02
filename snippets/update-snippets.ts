import { join } from 'path';

import { writeFileSync } from 'fs-extra';

const snippetsFolderDestinationPath = join(__dirname, '..', '.vscode');
const snippetsSourceFolderNames = [
  'mui-component-snippet',
  'mui-generic-component-snippet',
  'mui-hook-snippet',
];

snippetsSourceFolderNames.map((folderName) => {
  const { default: snippetConfig } = require(`./${folderName}`);
  writeFileSync(
    `${snippetsFolderDestinationPath}/${folderName}.code-snippets`,
    JSON.stringify(snippetConfig, null, 2)
  );
});

console.log('Snippets updated!');
