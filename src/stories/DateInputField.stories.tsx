import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DateInputField } from '../components';

export default {
  title: 'Components/Input Fields/Date Input Field',
  component: DateInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DateInputField>;

const Template: ComponentStory<typeof DateInputField> = ({ required }) => {
  return <DateInputField label="Date" {...{ required }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
