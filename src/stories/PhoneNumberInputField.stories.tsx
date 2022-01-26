import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { PhoneNumberInputField } from '../components';

export default {
  title: 'Input Fields/Phone Number Input Field',
  component: PhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PhoneNumberInputField>;

const Template: ComponentStory<typeof PhoneNumberInputField> = ({
  sx,
  ...rest
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <PhoneNumberInputField
      label="Phone Number"
      {...rest}
      sx={{ width: 500, ...sx }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  required: true,
};
