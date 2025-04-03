import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import {
  PhoneNumberInputField,
  PhoneNumberInputFieldProps,
} from '../../components/InputFields/PhoneNumberInputField';

export default {
  title: 'Components/Input Fields/Phone Number Input Field',
  component: PhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PhoneNumberInputField>;

const Template: StoryFn<typeof PhoneNumberInputField> = (props) => {
  return (
    <PhoneNumberInputField
      label="Phone Number"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
} as PhoneNumberInputFieldProps;

export const WithRegionalCode = Template.bind({});
WithRegionalCode.args = {
  regionalCode: 'UG',
} as PhoneNumberInputFieldProps;

export const WithUnformattedValue = Template.bind({});
WithUnformattedValue.args = {
  regionalCode: 'UG',
  value: '0701234567',
} as PhoneNumberInputFieldProps;

export const WithIncludedCountries = Template.bind({});
WithIncludedCountries.args = {
  includedCountries: ['UG', 'KE', 'TZ'],
} as PhoneNumberInputFieldProps;

export const WithIncludedCountriesAndDefaultRegionalCode = Template.bind({});
WithIncludedCountriesAndDefaultRegionalCode.args = {
  includedCountries: ['UG', 'KE', 'TZ'],
  regionalCode: 'US',
} as PhoneNumberInputFieldProps;

export const WithDisabledCountrySelector = Template.bind({});
WithDisabledCountrySelector.args = {
  regionalCode: 'UG',
  enablePhoneNumberCountrySelection: false,
} as PhoneNumberInputFieldProps;
