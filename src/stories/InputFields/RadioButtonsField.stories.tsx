import Container from '@mui/material/Container';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import RadioButtonsField, {
  RadioButtonsFieldProps,
} from '../../components/InputFields/RadioButtonsField';

export default {
  title: 'Components/Input Fields/Radio Buttons Field',
  component: RadioButtonsField,
} as ComponentMeta<typeof RadioButtonsField>;

const Template: ComponentStory<typeof RadioButtonsField> = (props) => {
  return (
    <Container maxWidth="md" sx={{ pt: 6 }}>
      <RadioButtonsField {...props} />
    </Container>
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
  label: 'Numbers',
  options: ['One', 'Two', 'Three'],
} as RadioButtonsFieldProps;
