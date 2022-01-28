import { ComponentMeta, ComponentStory } from '@storybook/react';

import { NumberInputField } from '../../components';

export default {
  title: 'Components/Input Fields/Number Input Field',
  component: NumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof NumberInputField>;

const Template: ComponentStory<typeof NumberInputField> = ({ required }) => {
  return (
    <NumberInputField label="Number" {...{ required }} sx={{ minWidth: 300 }} />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
