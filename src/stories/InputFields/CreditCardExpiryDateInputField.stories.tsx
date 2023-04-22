import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { CreditCardExpiryDateInputField } from '../../components/InputFields/CreditCardExpiryDateInputField';

export default {
  title:
    'Components/Input Fields/Credit Card Input Fields/Credit Card Expiry Date Input Field',
  component: CreditCardExpiryDateInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof CreditCardExpiryDateInputField>;

const Template: StoryFn<typeof CreditCardExpiryDateInputField> = (props) => {
  return (
    <CreditCardExpiryDateInputField
      label="Expiry date"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
