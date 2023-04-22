import Container from '@mui/material/Container';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import ImageSelector from '../components/ImageSelector';
import { FileUploadFunction } from '../interfaces/Utils';

export default {
  title: 'Components/Image Selector',
  component: ImageSelector,
} as Meta<typeof ImageSelector>;

const Template: StoryFn<typeof ImageSelector> = ({ ...rest }) => (
  <Container maxWidth="md" sx={{ p: 3 }}>
    <ImageSelector {...rest} />
  </Container>
);

const upload: FileUploadFunction = (
  imageFile,
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
      console.log('Cancelled Image Upload');
    },
  };
};

const uploadWithErrors: FileUploadFunction = (
  imageFile,
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
      console.log('Cancelled Image Upload With Errors');
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
