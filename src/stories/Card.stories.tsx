import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import Card, { ICardProps } from '../components/Card';

export default {
  title: 'Components/Card',
  component: Card,
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (props) => {
  return (
    <Box sx={{ height: '100vh', p: 3 }}>
      <Card {...props} />
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Card Title',
} as ICardProps;
