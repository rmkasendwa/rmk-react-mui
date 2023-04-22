import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ProfileAvatar, { ProfileAvatarProps } from '../components/ProfileAvatar';

export default {
  title: 'Components/Profile Avatar',
  component: ProfileAvatar,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof ProfileAvatar>;

const Template: StoryFn<typeof ProfileAvatar> = (props) => {
  return <ProfileAvatar {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Ronald Kasendwa',
} as ProfileAvatarProps;
