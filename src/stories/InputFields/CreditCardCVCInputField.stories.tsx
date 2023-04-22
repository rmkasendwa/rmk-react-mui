import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { CreditCardCVCInputField } from '../../components/InputFields/CreditCardCVCInputField';

export default {
  title:
    'Components/Input Fields/Credit Card Input Fields/Credit Card CVC Input Field',
  component: CreditCardCVCInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof CreditCardCVCInputField>;

const Template: StoryFn<typeof CreditCardCVCInputField> = (props) => {
  return (
    <CreditCardCVCInputField
      label="CVC / CVV"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
