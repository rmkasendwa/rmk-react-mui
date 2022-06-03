import { ComponentMeta, ComponentStory } from '@storybook/react';

import { PhoneNumberInputField } from '../../components/InputFields/PhoneNumberInputField';

export default {
  title: 'Components/Input Fields/Phone Number Input Field',
  component: PhoneNumberInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PhoneNumberInputField>;

const Template: ComponentStory<typeof PhoneNumberInputField> = (props) => {
  return (
    <PhoneNumberInputField
      label="Phone Number"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
