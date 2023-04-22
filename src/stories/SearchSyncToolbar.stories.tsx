import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import SearchSyncToolbar, {
  SearchSyncToolbarProps,
} from '../components/SearchSyncToolbar';

export default {
  title: 'Components/Search Sync Toolbar',
  component: SearchSyncToolbar,
} as Meta<typeof SearchSyncToolbar>;

const Template: StoryFn<typeof SearchSyncToolbar> = ({ ...rest }) => {
  return <SearchSyncToolbar {...rest} />;
};

export const Default = Template.bind({});
Default.args = {
  searchFieldPlaceholder: 'Search Records',
  load: () => {
    console.log('Loading...');
  },
} as SearchSyncToolbarProps;

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Title',
  searchFieldPlaceholder: 'Search Records',
  load: () => {
    console.log('Loading...');
  },
} as SearchSyncToolbarProps;

export const WithoutSearchTool = Template.bind({});
WithoutSearchTool.args = {
  title: 'Title',
  hasSearchTool: false,
  load: () => {
    console.log('Loading...');
  },
} as SearchSyncToolbarProps;
