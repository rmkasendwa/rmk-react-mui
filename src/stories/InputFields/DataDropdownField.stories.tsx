import { ComponentMeta, ComponentStory } from '@storybook/react';

import { DataDropdownField } from '../../components';

export default {
  title: 'Components/Input Fields/Data Dropdown Field',
  component: DataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DataDropdownField>;

const Template: ComponentStory<typeof DataDropdownField> = ({ required }) => {
  return (
    <DataDropdownField
      label="Dropdown"
      {...{ required }}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
