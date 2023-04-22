import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ProfileGravatar, {
  ProfileGravatarProps,
} from '../components/ProfileGravatar';

export default {
  title: 'Components/Profile Gravatar',
  component: ProfileGravatar,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof ProfileGravatar>;

const Template: StoryFn<typeof ProfileGravatar> = (props) => {
  return <ProfileGravatar {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Ronald Kasendwa',
  email: 'kasendwaronald@gmail.com',
} as ProfileGravatarProps;

export const WithEmailPartOfLabel = Template.bind({});
WithEmailPartOfLabel.args = {
  label: 'Ronald Kasendwa <kasendwaronald@gmail.com>',
} as ProfileGravatarProps;
