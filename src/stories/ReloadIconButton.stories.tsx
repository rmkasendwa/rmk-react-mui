import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ReloadIconButton, {
  ReloadIconButtonProps,
} from '../components/ReloadIconButton';

export default {
  title: 'Components/Reload Icon Button',
  component: ReloadIconButton,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof ReloadIconButton>;

const Template: StoryFn<typeof ReloadIconButton> = (props) => {
  return <ReloadIconButton {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  load: () => {
    console.log('Loading...');
  },
  dismissErrorMessage: () => {
    console.log('Dismissing error message...');
  },
} as ReloadIconButtonProps;
