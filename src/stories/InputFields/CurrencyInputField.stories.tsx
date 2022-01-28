import { ComponentMeta, ComponentStory } from '@storybook/react';

import { CurrencyInputField } from '../../components';

export default {
  title: 'Components/Input Fields/Currency Input Field',
  component: CurrencyInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof CurrencyInputField>;

const Template: ComponentStory<typeof CurrencyInputField> = ({ required }) => {
  return (
    <CurrencyInputField
      label="Currency"
      {...{ required }}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
