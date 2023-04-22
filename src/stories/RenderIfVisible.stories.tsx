import { Box, BoxProps, alpha } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import RenderIfVisible from '../components/RenderIfVisible';

export default {
  title: 'Components/Render If Visible',
  component: RenderIfVisible,
} as Meta<typeof RenderIfVisible>;

const Template: StoryFn<typeof Box> = ({ children, ...rest }) => {
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

export const WithPersistingRendering = Template.bind({});
WithPersistingRendering.args = {
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
            stayRendered
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

export const WithPlaceholderProps = Template.bind({});
WithPlaceholderProps.args = {
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
            PlaceholderProps={{
              sx: {
                border: `1px solid coral`,
                bgcolor: alpha('#88B04B', 0.1),
              },
            }}
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
