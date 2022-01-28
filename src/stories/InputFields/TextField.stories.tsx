import { ComponentMeta, ComponentStory } from '@storybook/react';

import { TextField } from '../../components';

export default {
  title: 'Components/Input Fields/Text Field',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof TextField>;

const Template: ComponentStory<typeof TextField> = ({ required }) => {
  return (
    <TextField label="Short Text" {...{ required }} sx={{ minWidth: 300 }} />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
