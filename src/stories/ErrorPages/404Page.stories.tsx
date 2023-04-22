import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ResourceNotFoundPage from '../../components/ErrorPages/404Page';

export default {
  title: 'Components/Error Pages/404 Page',
  component: ResourceNotFoundPage,
} as Meta<typeof ResourceNotFoundPage>;

const Template: StoryFn<typeof ResourceNotFoundPage> = (props) => {
  return <ResourceNotFoundPage {...props} />;
};

export const Default = Template.bind({});
Default.args = {};
