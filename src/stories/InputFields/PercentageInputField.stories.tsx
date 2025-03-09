import { Meta, StoryFn } from '@storybook/react';

import { PercentageInputField } from '../../components/InputFields/PercentageInputField';
import React from 'react';

export default {
  title: 'Components/Input Fields/Percentage Input Field',
  component: PercentageInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PercentageInputField>;

const Template: StoryFn<typeof PercentageInputField> = (props) => {
  return (
    <PercentageInputField
      label="Percentage Input Field"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
