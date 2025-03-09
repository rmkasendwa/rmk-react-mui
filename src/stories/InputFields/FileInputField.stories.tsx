import { Meta, StoryFn } from '@storybook/react';

import { FileInputField } from '../../components/InputFields/FileInputField';
import React from 'react';

export default {
  title: 'Components/Input Fields/File Input Field',
  component: FileInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FileInputField>;

const Template: StoryFn<typeof FileInputField> = (props) => {
  return (
    <FileInputField
      label="File Input Field"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
