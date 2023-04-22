import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import CloseButton from '../components/CloseButton';

export default {
  title: 'Components/Close Button',
  component: CloseButton,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof CloseButton>;

const Template: StoryFn<typeof CloseButton> = (props) => (
  <CloseButton {...props} />
);

export const Default = Template.bind({});
