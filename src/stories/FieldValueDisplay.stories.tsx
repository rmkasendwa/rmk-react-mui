import Chip from '@mui/material/Chip';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import FieldValueDisplay from '../components/FieldValueDisplay';

export default {
  title: 'Components/Field Value Display',
  component: FieldValueDisplay,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FieldValueDisplay>;

const Template: ComponentStory<typeof FieldValueDisplay> = (props) => {
  return <FieldValueDisplay label="The Label" {...props} />;
};

export const Default = Template.bind({});

export const WithStringValue = Template.bind({});
WithStringValue.args = {
  value: 'This is the value',
};

export const WithNumericValue = Template.bind({});
WithNumericValue.args = {
  value: 2000,
};

export const WithElementValue = Template.bind({});
WithElementValue.args = {
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
  ValueProps: {
    sx: {
      fontWeight: 'bold',
    },
  },
};
