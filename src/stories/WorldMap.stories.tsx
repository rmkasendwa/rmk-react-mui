import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import WorldMap from '../components/WorldMap';

export default {
  title: 'Components/World Map',
  component: WorldMap,
} as Meta<typeof WorldMap>;

const Template: StoryFn<typeof WorldMap> = (props) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
      }}
    >
      <WorldMap
        {...props}
        sx={{
          width: '100%',
        }}
      />
    </Box>
  );
};

export const Default = Template.bind({});
