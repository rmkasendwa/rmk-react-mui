import LockOpenIcon from '@mui/icons-material/LockOpen';
import Chip from '@mui/material/Chip';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import FieldValueDisplay, {
  FieldValueDisplayProps,
} from '../components/FieldValueDisplay';

export default {
  title: 'Components/Field Value Display',
  component: FieldValueDisplay,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FieldValueDisplay>;

const Template: StoryFn<typeof FieldValueDisplay> = (props) => {
  return <FieldValueDisplay {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'The Label',
  value: 'This is the value',
} as FieldValueDisplayProps;

export const WithStringValue = Template.bind({});
WithStringValue.args = {
  label: 'The Label',
  value: 'This is the value',
} as FieldValueDisplayProps;

export const WithNumericValue = Template.bind({});
WithNumericValue.args = {
  label: 'Numeric Field',
  value: 2000,
} as FieldValueDisplayProps;

export const WithEditableFieldValue = Template.bind({});
WithEditableFieldValue.args = {
  label: 'Numeric Field',
  value: 2000,
  fieldValueEditor: async (value) => {
    console.log({ value });
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ value });
      }, 3000);
    });
  },
  onFieldValueUpdated: () => {
    console.log('Updated!');
  },
  type: 'number',
  editable: true,
} as FieldValueDisplayProps;

export const WithElementValue = Template.bind({});
WithElementValue.args = {
  label: 'The Label',
  value: <Chip label="A reasonably long value" color="success" size="small" />,
} as FieldValueDisplayProps;

export const StyledDifferently = Template.bind({});
StyledDifferently.args = {
  label: 'Created On',
  value: 'Nov 23 2022',
  LabelProps: {
    sx: {
      fontWeight: 'normal',
    },
  },
  FieldValueProps: {
    sx: {
      fontWeight: 'bold',
    },
  },
} as FieldValueDisplayProps;

export const WithIcons = Template.bind({});
WithIcons.args = {
  label: 'The Label',
  value: <Chip label="A reasonably long value" color="success" size="small" />,
  FieldValueProps: {
    endIcon: <LockOpenIcon />,
  },
} as FieldValueDisplayProps;
