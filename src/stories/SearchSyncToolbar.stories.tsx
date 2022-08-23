import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import SearchSyncToolbar, {
  ISearchSyncToolbarProps,
} from '../components/SearchSyncToolbar';

export default {
  title: 'Components/Search Sync Toolbar',
  component: SearchSyncToolbar,
} as ComponentMeta<typeof SearchSyncToolbar>;

const Template: ComponentStory<typeof SearchSyncToolbar> = ({ ...rest }) => {
  return <SearchSyncToolbar {...rest} />;
};

export const Default = Template.bind({});
Default.args = {
  searchFieldPlaceholder: 'Search Records',
  load: () => {
    console.log('Loading...');
  },
} as ISearchSyncToolbarProps;

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Title',
  searchFieldPlaceholder: 'Search Records',
  load: () => {
    console.log('Loading...');
  },
} as ISearchSyncToolbarProps;
