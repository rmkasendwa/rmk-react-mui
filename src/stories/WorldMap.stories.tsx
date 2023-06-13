import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import WorldMap from '../components/WorldMap';

export default {
  title: 'Components/World Map',
  component: WorldMap,
} as Meta<typeof WorldMap>;

const Template: StoryFn<typeof WorldMap> = (props) => {
  return (
    <WorldMap
      {...props}
      sx={{
        width: '100%',
      }}
    />
  );
};

export const Default = Template.bind({});
