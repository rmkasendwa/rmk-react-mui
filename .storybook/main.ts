import type { StorybookConfig } from '@storybook/react-webpack5';

const path = require('path');
const toPath = (filePath) => path.join(process.cwd(), filePath);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@react-theming/storybook-addon',
    'storybook-dark-mode',
    '@storybook/addon-mdx-gfm',
  ],
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@emotion/core': toPath('node_modules/@emotion/react'),
        'emotion-theming': toPath('node_modules/@emotion/react'),
      },
    };
    return config;
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true,
  },
};

export default config;
