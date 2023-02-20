import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';

import InfiniteScrollBox, {
  InfiniteScrollBoxProps,
} from '../components/InfiniteScrollBox';

export default {
  title: 'Components/Infinite Scroll Box',
  component: InfiniteScrollBox,
} as ComponentMeta<typeof InfiniteScrollBox>;

const lorem = new LoremIpsum();

const Template: ComponentStory<typeof InfiniteScrollBox> = ({
  sx,
  ...rest
}) => (
  <InfiniteScrollBox
    {...rest}
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      ...sx,
    }}
  />
);

const defaultElements = Array.from({ length: 1000 }).map((_, index) => {
  const label = `${index + 1}. ${lorem.generateWords(4)}`;
  return (
    <Button
      key={index}
      color="inherit"
      fullWidth
      sx={{
        p: 0,
        justifyContent: 'start',
      }}
    >
      <Typography
        noWrap
        sx={{
          lineHeight: '50px',
          px: 3,
        }}
      >
        {label}
      </Typography>
    </Button>
  );
});
export const Default = Template.bind({});
Default.args = {
  children: <>{defaultElements.slice(0, 100)}</>,
  load: () => {
    console.log('Should load');
  },
} as InfiniteScrollBoxProps;

export const WithPaging = Template.bind({});
WithPaging.args = {
  dataElements: defaultElements.slice(0, 100),
  load: () => {
    console.log('Should load');
  },
  dataElementLength: 50,
  paging: true,
} as InfiniteScrollBoxProps;
