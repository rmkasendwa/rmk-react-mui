import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import AccessDeniedPage from '../../components/ErrorPages/403Page';

export default {
  title: 'Components/Error Pages/403 Page',
  component: AccessDeniedPage,
} as Meta<typeof AccessDeniedPage>;

const Template: StoryFn<typeof AccessDeniedPage> = (props) => {
  return <AccessDeniedPage {...props} />;
};

export const Default = Template.bind({});
Default.args = {};
