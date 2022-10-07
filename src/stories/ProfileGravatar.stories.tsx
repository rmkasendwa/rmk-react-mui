import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import ProfileGravatar, {
  IProfileGravatarProps,
} from '../components/ProfileGravatar';

export default {
  title: 'Components/Profile Gravatar',
  component: ProfileGravatar,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof ProfileGravatar>;

const Template: ComponentStory<typeof ProfileGravatar> = (props) => {
  return <ProfileGravatar {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Ronald Kasendwa',
  email: 'kasendwaronald@gmail.com',
} as IProfileGravatarProps;
