import Box from '@mui/material/Box';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import Card, { CardProps } from '../components/Card';

export default {
  title: 'Components/Card',
  component: Card,
} as Meta<typeof Card>;

const Template: StoryFn<typeof Card> = (props) => {
  return (
    <Box sx={{ height: '100vh', p: 3 }}>
      <Card {...props} />
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Card Title',
} as CardProps;
