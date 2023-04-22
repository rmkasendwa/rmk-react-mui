import { Box, BoxProps, Card, Typography } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import PaddedContentArea from '../components/PaddedContentArea';

export default {
  title: 'Components/Padded Content Area',
  component: PaddedContentArea,
} as Meta<typeof PaddedContentArea>;

const Template: StoryFn<typeof Box> = ({ children, ...rest }) => {
  return <Box {...rest}>{children}</Box>;
};

export const Default = Template.bind({});
Default.args = {
  children: (
    <PaddedContentArea title="Padded Content Area">
      {Array.from({ length: 12 }).map((_, index) => {
        return (
          <Card key={index} sx={{ p: 2, mb: 3 }}>
            <Typography>Card {index + 1}</Typography>
            <Box sx={{ height: 160 }} />
          </Card>
        );
      })}
    </PaddedContentArea>
  ),
} as BoxProps;
