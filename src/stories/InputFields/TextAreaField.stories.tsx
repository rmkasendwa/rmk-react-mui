import Container from '@mui/material/Container';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { TextAreaField } from '../../components/InputFields/TextAreaField';

export default {
  title: 'Components/Input Fields/Text Area Field',
  component: TextAreaField,
} as ComponentMeta<typeof TextAreaField>;

const Template: ComponentStory<typeof TextAreaField> = (props) => {
  return (
    <Container maxWidth="md" sx={{ pt: 6 }}>
      <TextAreaField
        label="Long Text"
        inputProps={{
          maxLength: 200,
        }}
        {...props}
        fullWidth
      />
    </Container>
  );
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};
