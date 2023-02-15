import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import AccessDeniedPage from '../../components/ErrorPages/403Page';

export default {
  title: 'Components/Error Pages/403 Page',
  component: AccessDeniedPage,
} as ComponentMeta<typeof AccessDeniedPage>;

const Template: ComponentStory<typeof AccessDeniedPage> = (props) => {
  return <AccessDeniedPage {...props} />;
};

export const Default = Template.bind({});
Default.args = {};
