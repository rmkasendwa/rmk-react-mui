import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DateInputField } from '../../components';

export default {
  title: 'Components/Input Fields/Date Input Field',
  component: DateInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DateInputField>;

const Template: ComponentStory<typeof DateInputField> = (props) => {
  return <DateInputField label="Date" {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
