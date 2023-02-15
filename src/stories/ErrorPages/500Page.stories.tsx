import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import InternalErrorPage from '../../components/ErrorPages/500Page';

export default {
  title: 'Components/Error Pages/500 Page',
  component: InternalErrorPage,
} as ComponentMeta<typeof InternalErrorPage>;

const Template: ComponentStory<typeof InternalErrorPage> = (props) => {
  return <InternalErrorPage {...props} />;
};

export const Default = Template.bind({});
Default.args = {};
