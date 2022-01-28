require('datejs');

const fs = require('fs-extra');
const { omit } = require('underscore');
const os = require('os');
const { execSync } = require('child_process');
const currentWorkingDirectory = process.cwd();
const outputDirectory = `${currentWorkingDirectory}/lib`;

const packageFile = require(`${currentWorkingDirectory}/package.json`);
const project = {
  ...omit(packageFile, 'devDependencies', 'jest', 'scripts'),
  main: './index.js',
  types: './index.d.ts',
};

try {
  const commitId = execSync('git rev-parse HEAD').toString().trim();
  const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  const commitAuthor = {
    name: execSync('git log --format=%an -1').toString().trim(),
    email: execSync('git log --format=%ae -1').toString().trim(),
  };
  const commit = execSync('git log -1').toString().trim();
  const branch =
    process.env.BRANCH_NAME ||
    execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const buildTime = new Date().toString();
  const builder = os.userInfo().username;
  const buildMachine = os.hostname();
  const buildNumber = process.env.BUILD_NUMBER;
  Object.assign(project, {
    commit: {
      id: commitId,
      fullCommitInfo: commit,
      message: commitMessage,
      author: commitAuthor,
    },
    branch,
    buildTime,
    builder,
    buildMachine,
    buildNumber,
  });
} catch (exception) {
  console.error(exception);
}
fs.writeFileSync(
  `${outputDirectory}/package.json`,
  JSON.stringify(project, null, 2)
);
['README.md', 'LICENSE'].forEach((fileName) => {
  fs.copySync(
    `${currentWorkingDirectory}/${fileName}`,
    `${outputDirectory}/${fileName}`
  );
});
