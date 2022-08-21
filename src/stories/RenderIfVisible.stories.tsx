import { Box, BoxProps } from '@mui/material';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import RenderIfVisible from '../components/RenderIfVisible';

export default {
  title: 'Components/Render If Visible',
  component: RenderIfVisible,
} as ComponentMeta<typeof RenderIfVisible>;

const Template: ComponentStory<typeof Box> = ({ children, ...rest }) => {
  return <Box {...rest}>{children}</Box>;
};

const DIMENSIONS = {
  width: 100,
  height: 100,
};
export const Default = Template.bind({});
Default.args = {
  children: (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {Array.from({ length: 200 }).map((_, index) => {
        return (
          <RenderIfVisible
            key={index}
            defaultPlaceholderDimensions={DIMENSIONS}
          >
            <Box
              sx={{
                bgcolor: 'teal',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...DIMENSIONS,
              }}
            >
              {index}
            </Box>
          </RenderIfVisible>
        );
      })}
    </Box>
  ),
} as BoxProps;
