import { alpha } from '@mui/system/colorManipulator';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import EnumValueChip from '../components/EnumValueChip';

export default {
  title: 'Components/Enum Value Chip',
  component: EnumValueChip,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof EnumValueChip>;

const Template: StoryFn<typeof EnumValueChip> = (props) => (
  <EnumValueChip
    {...props}
    colors={{
      ACTIVE: '#4F945C',
      PENDING: '#EDB80B',
      TRANSLUSENT: alpha('#1F0E68', 0.3),
    }}
  />
);

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
