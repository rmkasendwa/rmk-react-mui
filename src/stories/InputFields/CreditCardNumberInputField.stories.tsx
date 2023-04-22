import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { CreditCardNumberInputField } from '../../components/InputFields/CreditCardNumberInputField';

export default {
  title:
    'Components/Input Fields/Credit Card Input Fields/Credit Card Number Input Field',
  component: CreditCardNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof CreditCardNumberInputField>;

const Template: StoryFn<typeof CreditCardNumberInputField> = (props) => {
  return (
    <CreditCardNumberInputField
      label="Credit/Debit Card"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
