import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ImageSelector } from '../components';
import { IImageUploadFunction } from '../interfaces';

export default {
  title: 'Components/Image Selector',
  component: ImageSelector,
} as ComponentMeta<typeof ImageSelector>;

const Template: ComponentStory<typeof ImageSelector> = ({ ...rest }) => (
  <Box sx={{ maxWidth: 640, p: 3, mx: 'auto' }}>
    <ImageSelector {...rest} />
  </Box>
);

const upload: IImageUploadFunction = (
  imageFile,
  { onComplete, onError, onProgress, onSuccess }
) => {
  console.log({ imageFile, onError });
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

const uploadWithErrors: IImageUploadFunction = (
  imageFile,
  { onComplete, onError, onProgress }
) => {
  console.log({ imageFile, onError });
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

export const AutoUpload = Template.bind({});
AutoUpload.args = {
  upload,
};

export const AutoUploadWithErrors = Template.bind({});
AutoUploadWithErrors.args = {
  upload: uploadWithErrors,
};
