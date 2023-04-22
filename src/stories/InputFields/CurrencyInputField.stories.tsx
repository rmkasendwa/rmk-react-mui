import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { CurrencyInputField } from '../../components/InputFields/CurrencyInputField';

export default {
  title: 'Components/Input Fields/Currency Input Field',
  component: CurrencyInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof CurrencyInputField>;

const Template: StoryFn<typeof CurrencyInputField> = (props) => {
  return (
    <CurrencyInputField
      label="Currency Input Field"
      showCurrency
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
