import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import SingleFieldCard, {
  SingleFieldCardProps,
} from '../components/SingleFieldCard';

export default {
  title: 'Components/Single Field Card',
  component: SingleFieldCard,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof SingleFieldCard>;

const Template: StoryFn<typeof SingleFieldCard> = ({ sx, ...rest }) => {
  return (
    <SingleFieldCard
      {...rest}
      sx={{
        width: 400,
        ...sx,
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  label: 'The Label',
  value: 'The Value',
} as SingleFieldCardProps;
