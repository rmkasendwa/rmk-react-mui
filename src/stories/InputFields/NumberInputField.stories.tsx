import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import NumberInputField, {
  NumberInputFieldProps,
} from '../../components/InputFields/NumberInputField';

export default {
  title: 'Components/Input Fields/Number Input Field',
  component: NumberInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof NumberInputField>;

const Template: StoryFn<typeof NumberInputField> = (props) => {
  return <NumberInputField label="Number" {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
} as NumberInputFieldProps;

export const WithValueScaleFactor = Template.bind({});
WithValueScaleFactor.args = {
  valueScaleFactor: 100,
  onChange: (event) => {
    console.log(event.target.value);
  },
  required: true,
} as NumberInputFieldProps;
