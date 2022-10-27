import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import {
  DateInputField,
  DateInputFieldProps,
} from '../../components/InputFields/DateInputField';

export default {
  title: 'Components/Input Fields/Date Input Field',
  component: DateInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DateInputField>;

const Template: ComponentStory<typeof DateInputField> = (props) => {
  return <DateInputField {...props} sx={{ minWidth: 300 }} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Date',
  required: true,
  onChange: (event) => {
    console.log(event.target.value);
  },
} as DateInputFieldProps;

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  required: true,
  placeholder: 'From',
};

export const MinDate = Template.bind({});
MinDate.args = {
  required: true,
  minDate: new Date().toISOString(),
};

export const MaxDate = Template.bind({});
MaxDate.args = {
  required: true,
  maxDate: new Date().toISOString(),
};
