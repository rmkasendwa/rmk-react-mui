import { Meta, StoryFn } from '@storybook/react';

import { TextField } from '../../components/InputFields/TextField';

export default {
  title: 'Components/Input Fields/Text Field',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof TextField>;

const Template: StoryFn<typeof TextField> = (props) => {
  return <TextField label="Short Text" {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
