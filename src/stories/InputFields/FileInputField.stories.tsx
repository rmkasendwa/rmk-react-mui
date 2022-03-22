import { ComponentMeta, ComponentStory } from '@storybook/react';

import { FileInputField } from '../../components';

export default {
  title: 'Components/Input Fields/File Input Field',
  component: FileInputField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FileInputField>;

const Template: ComponentStory<typeof FileInputField> = (props) => {
  return (
    <FileInputField
      label="File Input Field"
      {...props}
      sx={{ minWidth: 300 }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
