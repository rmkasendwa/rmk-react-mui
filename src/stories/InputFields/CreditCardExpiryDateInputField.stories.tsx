import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CreditCardExpiryDateInputField } from '../../components/InputFields/CreditCardExpiryDateInputField';

export default {
  title:
    'Components/Input Fields/Credit Card Input Fields/Credit Card Expiry Date Input Field',
  component: CreditCardExpiryDateInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof CreditCardExpiryDateInputField>;

const Template: ComponentStory<typeof CreditCardExpiryDateInputField> = (
  props
) => {
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
