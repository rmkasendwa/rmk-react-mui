import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import SearchField, { SearchFieldProps } from '../components/SearchField';

export default {
  title: 'Components/Search Field',
  component: SearchField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof SearchField>;

const Template: StoryFn<typeof SearchField> = ({ sx, ...rest }) => {
  return (
    <SearchField
      {...rest}
      sx={{
        width: 300,
        ...sx,
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  onSearch: (searchTerm) => {
    console.log(`Search term: ${searchTerm}`);
  },
} as SearchFieldProps;
