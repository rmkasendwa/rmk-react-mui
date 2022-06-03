import { ComponentMeta, ComponentStory } from '@storybook/react';

import { NumberInputField } from '../../components/InputFields/NumberInputField';

export default {
  title: 'Components/Input Fields/Number Input Field',
  component: NumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof NumberInputField>;

const Template: ComponentStory<typeof NumberInputField> = (props) => {
  return <NumberInputField label="Number" {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
