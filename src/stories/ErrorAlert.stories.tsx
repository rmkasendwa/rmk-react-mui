import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ErrorAlert, { ErrorAlertProps } from '../components/ErrorAlert';

export default {
  title: 'Components/Error Alert',
  component: ErrorAlert,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof ErrorAlert>;

const Template: StoryFn<typeof ErrorAlert> = (props) => (
  <ErrorAlert {...props} />
);

export const Default = Template.bind({});
Default.args = {
  message: "Error: 'Loading user account details' failed. Something went wrong",
  retry: () => {
    console.log('Retrying...');
  },
} as ErrorAlertProps;
