import { ComponentMeta, ComponentStory } from '@storybook/react';

import { PercentageInputField } from '../../components/InputFields/PercentageInputField';

export default {
  title: 'Components/Input Fields/Percentage Input Field',
  component: PercentageInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PercentageInputField>;

const Template: ComponentStory<typeof PercentageInputField> = (props) => {
  return (
    <PercentageInputField
      label="Percentage Input Field"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
