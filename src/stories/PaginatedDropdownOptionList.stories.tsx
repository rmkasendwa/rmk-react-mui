import { Meta, StoryFn } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';

import PaginatedDropdownOptionList, {
  PaginatedDropdownOptionListProps,
} from '../components/PaginatedDropdownOptionList';

export default {
  title: 'Components/Paginated Dropdown Option List',
  component: PaginatedDropdownOptionList,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PaginatedDropdownOptionList>;

const lorem = new LoremIpsum();

const Template: StoryFn<typeof PaginatedDropdownOptionList> = (props) => {
  return <PaginatedDropdownOptionList {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
} as PaginatedDropdownOptionListProps;

export const WithOptions = Template.bind({});
WithOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
} as PaginatedDropdownOptionListProps;

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  multiple: true,
} as PaginatedDropdownOptionListProps;

export const LoadingWithEmptyOptions = Template.bind({});
LoadingWithEmptyOptions.args = {
  options: [],
  loading: true,
} as PaginatedDropdownOptionListProps;

export const LoadingWithOptions = Template.bind({});
LoadingWithOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  loading: true,
} as PaginatedDropdownOptionListProps;
