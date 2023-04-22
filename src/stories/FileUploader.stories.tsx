import Container from '@mui/material/Container';
import { Meta, StoryFn } from '@storybook/react';

import FileUploader from '../components/FileUploader';
import { FileDownloadFunction, FileUploadFunction } from '../interfaces/Utils';

export default {
  title: 'Components/File Uploader',
  component: FileUploader,
} as Meta<typeof FileUploader>;

const Template: StoryFn<typeof FileUploader> = (props) => (
  <Container maxWidth="lg" sx={{ p: 3 }}>
    <FileUploader {...props} />
  </Container>
);

const upload: FileUploadFunction = (
  file,
  { onComplete, onProgress, onSuccess }
) => {
  const DELAY = 10000;
  const STEPPER = 100;
  let countDown = DELAY;
  const interval = setInterval(() => {
    countDown -= STEPPER;
    onProgress(((DELAY - countDown) / DELAY) * 100);
    if (countDown <= 0) {
      clearInterval(interval);
      onSuccess({});
      onComplete();
    }
  }, STEPPER);
  return {
    cancel: () => {
      clearInterval(interval);
      console.log('Cancelled File Upload');
    },
  };
};

const uploadWithErrors: FileUploadFunction = (
  file,
  { onComplete, onError, onProgress }
) => {
  const DELAY = 10000;
  const STEPPER = 100;
  let countDown = DELAY;
  const errorStage = Math.floor(Math.random() * DELAY);
  const interval = setInterval(() => {
    countDown -= STEPPER;
    onProgress(((DELAY - countDown) / DELAY) * 100);
    if (countDown <= errorStage) {
      clearInterval(interval);
      onError(new Error('Failed to upload'));
      onComplete();
    }
  }, STEPPER);
  return {
    cancel: () => {
      clearInterval(interval);
      console.log('Cancelled File Upload With Errors');
    },
  };
};

const download: FileDownloadFunction = (
  {},
  { onComplete, onError, onProgress }
) => {
  const DELAY = 10000;
  const STEPPER = 100;
  let countDown = DELAY;
  const errorStage = Math.floor(Math.random() * DELAY);
  const interval = setInterval(() => {
    countDown -= STEPPER;
    onProgress(((DELAY - countDown) / DELAY) * 100);
    if (countDown <= errorStage) {
      clearInterval(interval);
      onError(new Error('Failed to download'));
      onComplete();
    }
  }, STEPPER);
  return {
    cancel: () => {
      clearInterval(interval);
      console.log('Cancelled File Download');
    },
  };
};

export const Default = Template.bind({});

export const WithFieldErrorMessage = Template.bind({});
WithFieldErrorMessage.args = {
  error: true,
  helperText: 'This is an error message',
};

export const AutoUpload = Template.bind({});
AutoUpload.args = {
  upload,
};

export const AutoUploadWithErrors = Template.bind({});
AutoUploadWithErrors.args = {
  upload: uploadWithErrors,
};

export const Download = Template.bind({});
Download.args = {
  upload,
  download,
};
