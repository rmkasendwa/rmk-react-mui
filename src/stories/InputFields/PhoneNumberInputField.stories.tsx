import { ComponentMeta, ComponentStory } from '@storybook/react';

import { PhoneNumberInputField } from '../../components';

export default {
  title: 'Components/Input Fields/Phone Number Input Field',
  component: PhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PhoneNumberInputField>;

const Template: ComponentStory<typeof PhoneNumberInputField> = ({
  required,
}) => {
  return (
    <PhoneNumberInputField
      label="Phone Number"
      {...{ required }}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
