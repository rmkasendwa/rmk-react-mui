import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { FileUploader } from '../components';

export default {
  title: 'Components/File Uploader',
  component: FileUploader,
} as ComponentMeta<typeof FileUploader>;

const Template: ComponentStory<typeof FileUploader> = () => (
  <Box sx={{ maxWidth: 1200, p: 3, mx: 'auto' }}>
    <FileUploader />
  </Box>
);

export const Default = Template.bind({});
