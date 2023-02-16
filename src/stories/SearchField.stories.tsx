import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import SearchField, { SearchFieldProps } from '../components/SearchField';

export default {
  title: 'Components/Search Field',
  component: SearchField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof SearchField>;

const Template: ComponentStory<typeof SearchField> = ({ sx, ...rest }) => {
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
