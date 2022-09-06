import { ComponentMeta, ComponentStory } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';

import PaginatedDropdownOptionList from '../components/PaginatedDropdownOptionList';

export default {
  title: 'Components/Paginated Dropdown Option List',
  component: PaginatedDropdownOptionList,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof PaginatedDropdownOptionList>;

const lorem = new LoremIpsum();

const Template: ComponentStory<typeof PaginatedDropdownOptionList> = (
  props
) => {
  return <PaginatedDropdownOptionList {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
};

export const WithOptions = Template.bind({});
WithOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
};

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  multiple: true,
};

export const LoadingWithEmptyOptions = Template.bind({});
LoadingWithEmptyOptions.args = {
  options: [],
  loadOptions: () => {
    console.log('Loading options');
  },
  loading: true,
};

export const LoadingWithOptions = Template.bind({});
LoadingWithOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  loadOptions: () => {
    console.log('Loading options');
  },
  loading: true,
};
