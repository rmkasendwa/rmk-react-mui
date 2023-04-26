import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import DatePicker, { DatePickerProps } from '../components/DatePicker';

export default {
  title: 'Components/Date Picker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof DatePicker>;

const Template: StoryFn<typeof DatePicker> = (props) => (
  <DatePicker {...props} />
);

export const Default = Template.bind({});
Default.args = {} as DatePickerProps;

export const WithTimeSelector = Template.bind({});
WithTimeSelector.args = {
  showTimeSelect: true,
  showTimeInput: true,
} as DatePickerProps;
