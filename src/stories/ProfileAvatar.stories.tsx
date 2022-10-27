import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import ProfileAvatar, { ProfileAvatarProps } from '../components/ProfileAvatar';

export default {
  title: 'Components/Profile Avatar',
  component: ProfileAvatar,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof ProfileAvatar>;

const Template: ComponentStory<typeof ProfileAvatar> = (props) => {
  return <ProfileAvatar {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Ronald Kasendwa',
} as ProfileAvatarProps;
