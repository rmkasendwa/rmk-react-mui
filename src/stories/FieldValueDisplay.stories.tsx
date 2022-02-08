import { Chip } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { FieldValueDisplay } from '../components';

export default {
  title: 'Components/Field Value Display',
  component: FieldValueDisplay,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FieldValueDisplay>;

const Template: ComponentStory<typeof FieldValueDisplay> = ({ value }) => {
  const props: any = {};
  value != null && (props.value = value);

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
  value: <Chip label="Value" color="success" size="small" />,
};
