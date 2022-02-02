import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DataDropdownField } from '../../components';

export default {
  title: 'Components/Input Fields/Data Dropdown Field',
  component: DataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DataDropdownField>;

const Template: ComponentStory<typeof DataDropdownField> = ({
  required,
  label,
  options,
}) => {
  const props: any = {};
  required && (props.required = required);
  label && (props.label = label);
  options && (props.options = options);

  return (
    <DataDropdownField label="Dropdown" {...props} sx={{ minWidth: 300 }} />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};

export const WithStaticOptions = Template.bind({});
WithStaticOptions.args = {
  label: 'Dropdown With Options',
  required: true,
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
};

export const WithOverflowingOptions = Template.bind({});
WithOverflowingOptions.args = {
  label: 'Dropdown With Many Options',
  required: true,
  options: Array.from({ length: 200 }).map((_, index) => ({
    label: String(index),
    value: index,
  })),
};
