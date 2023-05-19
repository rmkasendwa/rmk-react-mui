import { Typography } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import TextField, {
  TextFieldProps,
} from '../../components/InputFields/TextField';

export default {
  title: 'Components/Input Fields/Text Field',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof TextField>;

const Template: StoryFn<typeof TextField> = (props) => {
  return <TextField label="Short Text" {...props} sx={{ minWidth: 400 }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};

export const LabelWrapped = Template.bind({});
LabelWrapped.args = {
  required: true,
  labelWrapped: true,
  FieldValueDisplayProps: {
    helpTip: 'This is a help tip',
    labelSuffix: (
      <Typography
        variant="body2"
        color="primary"
        sx={{
          fontSize: 12,
        }}
      >
        This is a suffix
      </Typography>
    ),
  },
} as TextFieldProps;

export const LabelWrappedDisabled = Template.bind({});
LabelWrappedDisabled.args = {
  required: true,
  labelWrapped: true,
  FieldValueDisplayProps: {
    helpTip: 'This is a help tip',
    labelSuffix: (
      <Typography
        variant="body2"
        color="primary"
        sx={{
          fontSize: 12,
        }}
      >
        This is a suffix
      </Typography>
    ),
  },
  disabled: true,
} as TextFieldProps;
