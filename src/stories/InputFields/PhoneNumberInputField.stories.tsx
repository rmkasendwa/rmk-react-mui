import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { PhoneNumberInputField } from '../../components/InputFields/PhoneNumberInputField';

export default {
  title: 'Components/Input Fields/Phone Number Input Field',
  component: PhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PhoneNumberInputField>;

const Template: StoryFn<typeof PhoneNumberInputField> = (props) => {
  return (
    <PhoneNumberInputField
      label="Phone Number"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
