import Chip from '@mui/material/Chip';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import FieldValueDisplay from '../components/FieldValueDisplay';

export default {
  title: 'Components/Field Value Display',
  component: FieldValueDisplay,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FieldValueDisplay>;

const Template: ComponentStory<typeof FieldValueDisplay> = (props) => {
  return <FieldValueDisplay {...props} />;
};

export const Default = Template.bind({
  label: 'The Label',
});

export const WithStringValue = Template.bind({
  label: 'The Label',
});

WithStringValue.args = {
  label: 'The Label',
  value: 'This is the value',
};

export const WithNumericValue = Template.bind({});
WithNumericValue.args = {
  label: 'The Label',
  value: 2000,
};

export const WithElementValue = Template.bind({});
WithElementValue.args = {
  label: 'The Label',
  value: <Chip label="A reasonably long value" color="success" size="small" />,
};

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
};
