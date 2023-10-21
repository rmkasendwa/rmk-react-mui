import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import FieldSet, { FieldSetProps } from '../components/FieldSet';

export default {
  title: 'Components/Field Set',
  component: FieldSet,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof FieldSet>;

const Template: StoryFn<typeof FieldSet> = ({ sx, ...rest }) => {
  return (
    <FieldSet
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
  label: 'Field Set',
} as FieldSetProps;
