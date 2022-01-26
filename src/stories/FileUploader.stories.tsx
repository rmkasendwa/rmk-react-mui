import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { FileUploader } from '../components';

export default {
  title: 'File Uploader',
  component: FileUploader,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof FileUploader>;

const Template: ComponentStory<typeof FileUploader> = ({ ...rest }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <FileUploader {...rest} />
  </Box>
);

export const Default = Template.bind({});
