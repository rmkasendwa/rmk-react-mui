import { alpha } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { EnumValueChip } from '../components';

export default {
  title: 'Components/Enum Value Chip',
  component: EnumValueChip,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof EnumValueChip>;

const Template: ComponentStory<typeof EnumValueChip> = (props) => {
  console.log({ props });
  return (
    <EnumValueChip
      colors={{
        ACTIVE: '#4F945C',
        PENDING: '#EDB80B',
        TRANSLUSENT: alpha('#1F0E68', 0.3),
      }}
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  label: 'Active',
  value: 'ACTIVE',
  onDelete: null,
};

export const LightBackgroundColor = Template.bind({});
LightBackgroundColor.args = {
  label: 'Pending',
  value: 'PENDING',
  onDelete: null,
};

export const TranslusentBackgroundColor = Template.bind({});
TranslusentBackgroundColor.args = {
  label: 'Translusent',
  value: 'TRANSLUSENT',
  onDelete: null,
};
