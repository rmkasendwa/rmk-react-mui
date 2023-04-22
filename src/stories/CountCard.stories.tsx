import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import CountCard, { CountCardProps } from '../components/CountCard';

export default {
  title: 'Components/Count Card',
  component: CountCard,
} as Meta<typeof CountCard>;

const Template: StoryFn<typeof CountCard> = (props) => <CountCard {...props} />;

const countFinder = () => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(Math.round(Math.random() * 1000)), 2000)
  );
};

export const Default = Template.bind({});
Default.args = {
  countFinder,
  sx: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
} as CountCardProps;

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'All Elements',
  labelPlural: 'Elements',
  countFinder,
} as CountCardProps;

export const WithAVeryLongLabel = Template.bind({});
WithAVeryLongLabel.args = {
  labelPlural: 'Pneumonoultramicroscopicsilicovolcanoconioses',
  labelSingular: 'Pneumonoultramicroscopicsilicovolcanoconiosis',
  countFinder,
} as CountCardProps;

export const WithPathToViewCountedRecords = Template.bind({});
WithPathToViewCountedRecords.args = {
  countFinder,
  pathToViewCountedRecords: '/path/to/view/counted/records',
} as CountCardProps;
