import { Box } from '@mui/material';
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

export const Searchable = Template.bind({});
Searchable.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  searchable: true,
} as PaginatedDropdownOptionListProps;

export const WithOptions = Template.bind({});
WithOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
} as PaginatedDropdownOptionListProps;

export const OptionsWithReallyLongLabels = Template.bind({});
OptionsWithReallyLongLabels.args = {
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(10)}`,
    value: index,
  })),
} as PaginatedDropdownOptionListProps;

export const WithMultipleLineOptions = Template.bind({});
WithMultipleLineOptions.args = {
  options: Array.from({ length: 100 }).map((_, index) => {
    const headingText = lorem.generateWords(3);
    const subHeadingText = lorem.generateWords(5);
    return {
      label: (
        <Box>
          <Box
            sx={{
              fontWeight: 'bold',
            }}
          >
            {headingText}
          </Box>
          <Box
            sx={{
              fontSize: '0.9em',
            }}
          >
            {subHeadingText}
          </Box>
        </Box>
      ),
      searchableLabel: subHeadingText,
      value: index,
    };
  }),
  optionHeight: 60,
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

const asyncSelectedOptionsDataSet = Array.from({ length: 1000 }).map(
  (_, index) => {
    const label = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      label,
      value: String(index),
    };
  }
);
export const WithAsyncOptions = Template.bind({});
WithAsyncOptions.args = {
  getDropdownOptions: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(asyncSelectedOptionsDataSet);
      }, 500);
    });
  },
  getSelectedOptions: (selectedValue) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (typeof selectedValue === 'string') {
          resolve(
            asyncSelectedOptionsDataSet.filter(({ value }) => {
              return value === selectedValue;
            })
          );
        } else {
          resolve([]);
        }
      }, 3000);
    });
  },
  value: '6',
} as PaginatedDropdownOptionListProps;
