import { ComponentMeta, ComponentStory } from '@storybook/react';
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
} as ComponentMeta<typeof ReloadIconButton>;

const Template: ComponentStory<typeof ReloadIconButton> = (props) => {
  return <ReloadIconButton {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  load: () => {
    console.log('Loading...');
  },
} as ReloadIconButtonProps;
