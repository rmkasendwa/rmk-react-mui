import Container from '@mui/material/Container';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import TextAreaField, {
  TextAreaFieldProps,
} from '../../components/InputFields/TextAreaField';

export default {
  title: 'Components/Input Fields/Text Area Field',
  component: TextAreaField,
} as Meta<typeof TextAreaField>;

const Template: StoryFn<typeof TextAreaField> = (props) => {
  return (
    <Container maxWidth="md" sx={{ pt: 6 }}>
      <TextAreaField label="Long Text" {...props} />
    </Container>
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
  slotProps: {
    htmlInput: {
      maxLength: 200,
    },
  },
  fullWidth: true,
} as TextAreaFieldProps;
