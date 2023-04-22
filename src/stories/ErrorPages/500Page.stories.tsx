import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import InternalErrorPage from '../../components/ErrorPages/500Page';

export default {
  title: 'Components/Error Pages/500 Page',
  component: InternalErrorPage,
} as Meta<typeof InternalErrorPage>;

const Template: StoryFn<typeof InternalErrorPage> = (props) => {
  return <InternalErrorPage {...props} />;
};

export const Default = Template.bind({});
Default.args = {};
