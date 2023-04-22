import '@infinite-debugger/rmk-js-extensions/String';

import Container from '@mui/material/Container';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import RichTextEditor, {
  RichTextEditorProps,
} from '../components/RichTextEditor';

export default {
  title: 'Components/Rich Text Editor',
  component: RichTextEditor,
} as Meta<typeof RichTextEditor>;

const Template: StoryFn<typeof RichTextEditor> = (props) => (
  <Container maxWidth="lg" sx={{ p: 3 }}>
    <RichTextEditor {...props} />
  </Container>
);

export const Default = Template.bind({});

export const WithValue = Template.bind({});
WithValue.args = {
  value: `
    <p>This is a paragaph</p>
    <p>This is another <strong>paragraph</strong></p>
  `,
  onChange: (event) => {
    console.log({ event });
  },
} as RichTextEditorProps;
