import AppleIcon from '@mui/icons-material/Apple';
import { Stack, Typography } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';

import FieldValue from '../../components/FieldValue';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../../components/InputFields/DataDropdownField';
import ProfileGravatar from '../../components/ProfileGravatar';

export default {
  title: 'Components/Input Fields/Data Dropdown Field',
  component: DataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof DataDropdownField>;

const lorem = new LoremIpsum();

const Template: StoryFn<typeof DataDropdownField> = ({ sx, ...props }) => {
  return <DataDropdownField {...props} sx={{ width: 400, ...sx }} />;
};

export const Default = Template.bind({});
Default.args = {
  required: true,
};

export const WithStaticOptions = Template.bind({});
WithStaticOptions.args = {
  label: 'Dropdown With Options',
  required: true,
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
  size: 'medium',
} as DataDropdownFieldProps;

export const DisabledWithValue = Template.bind({});
DisabledWithValue.args = {
  label: 'Disabled Dropdown',
  required: true,
  disabled: true,
  value: 'Two',
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
} as DataDropdownFieldProps;

export const TextVariantWithPlaceholder = Template.bind({});
TextVariantWithPlaceholder.args = {
  label: 'Dropdown With Options',
  required: true,
  variant: 'text',
  placeholder: 'Select an option',
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
} as DataDropdownFieldProps;

export const WithOverflowingOptions = Template.bind({});
WithOverflowingOptions.args = {
  label: 'Paginated Dropdown List',
  required: true,
  options: Array.from({ length: 200 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
} as DataDropdownFieldProps;

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  label: 'Multiple Select',
  required: true,
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  multiple: true,
} as DataDropdownFieldProps;

export const MultipleSelectWithValue = Template.bind({});
MultipleSelectWithValue.args = {
  label: 'Multiple Select With Value',
  required: true,
  options: [
    { label: '', value: '' },
    ...Array.from({ length: 100 }).map((_, index) => ({
      label: `${index + 1}. ${lorem.generateWords(2)}`,
      value: index,
    })),
  ],
  value: [2, '', 5, 11],
  multiple: true,
} as DataDropdownFieldProps;

export const MultipleSelectWithMultiline = Template.bind({});
MultipleSelectWithMultiline.args = {
  label: 'Multiple Select',
  required: true,
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(2)}`,
    value: index,
  })),
  multiple: true,
  multiline: true,
} as DataDropdownFieldProps;

export const WithSelectedOptionProp = Template.bind({});
WithSelectedOptionProp.args = {
  label: 'Custom Selected Option',
  required: true,
  selectedOption: {
    label: 'Selected Option',
    value: 'Selected Value',
  },
} as DataDropdownFieldProps;

export const ListeningToSearchEvent = Template.bind({});
ListeningToSearchEvent.args = {
  label: 'Custom Selected Option',
  required: true,
  onChangeSearchTerm: (searchTerm) => {
    console.log(searchTerm);
  },
} as DataDropdownFieldProps;

export const WithReactElementOptionLabels = Template.bind({});
WithReactElementOptionLabels.args = {
  label: 'Element Labels List',
  required: true,
  options: Array.from({ length: 10 }).map((_, index) => {
    const label = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      label: <Typography variant="body2">{label}</Typography>,
      searchableLabel: label,
      value: index,
    };
  }),
  multiple: true,
} as DataDropdownFieldProps;

export const WithSelectedOptionPillProps = Template.bind({});
WithSelectedOptionPillProps.args = {
  required: true,
  options: Array.from({ length: 10 }).map((_, index) => {
    const label = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      label: <Typography variant="body2">{label}</Typography>,
      value: index,
    };
  }),
  placeholder: 'Multiple select with placeholder',
  multiple: true,
  SelectedOptionPillProps: {
    sx: {
      bgcolor: 'transparent',
      px: 0,
      mr: 1,
    },
  },
} as DataDropdownFieldProps;

export const WithAsyncOptions = Template.bind({});
WithAsyncOptions.args = {
  label: 'Dropdown With Async Options',
  required: true,
  getDropdownOptions: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          [
            'One',
            'Two',
            'Three',
            'Four',
            'Five',
            'Six',
            'Seven',
            'Eight',
            'Nine',
            'Ten',
          ].map((value) => ({ label: value, value }))
        );
      }, 1000);
    });
  },
} as DataDropdownFieldProps;

export const WithDefaultOptions = Template.bind({});
WithDefaultOptions.args = {
  label: 'Dropdown With Async Options',
  required: true,
  defaultOptions: [
    {
      label: 'Default',
      value: 'default',
    },
  ],
  value: 'default',
  getDropdownOptions: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          [
            'One',
            'Two',
            'Three',
            'Four',
            'Five',
            'Six',
            'Seven',
            'Eight',
            'Nine',
            'Ten',
          ].map((value) => ({ label: value, value }))
        );
      }, 1000);
    });
  },
} as DataDropdownFieldProps;

const externallyPaginatedDataset = Array.from({ length: 1000 }).map(
  (_, index) => {
    const value = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      label: value,
      value,
    };
  }
);
export const ExternallyPaginated = Template.bind({});
ExternallyPaginated.args = {
  label: 'Dropdown With Async Options',
  required: true,
  getDropdownOptions: async ({ limit = 10, offset = 0, searchTerm }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredOptions = externallyPaginatedDataset.filter(
          ({ label }) => {
            return (
              !searchTerm ||
              String(label).toLowerCase().match(searchTerm.toLowerCase())
            );
          }
        );
        resolve({
          records: filteredOptions.slice(offset, offset + limit),
          recordsTotalCount: filteredOptions.length,
        });
      }, 500);
    });
  },
  externallyPaginated: true,
} as DataDropdownFieldProps;

export const WithOptionIcons = Template.bind({});
WithOptionIcons.args = {
  label: 'Option Icons',
  required: true,
  options: Array.from({ length: 10 }).map((_, index) => {
    const label = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      icon: <AppleIcon />,
      label: <Typography variant="body2">{label}</Typography>,
      searchableLabel: label,
      value: index,
    };
  }),
  multiple: true,
} as DataDropdownFieldProps;

const asyncSelectedOptionsDataSet = Array.from({ length: 1000 }).map(
  (_, index) => {
    const label = `${index + 1}. ${lorem.generateWords(4)}`;
    return {
      label,
      value: String(index),
    };
  }
);
export const WithAsyncSelectedOptions = Template.bind({});
WithAsyncSelectedOptions.args = {
  label: 'Async selected option',
  getDropdownOptions: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(asyncSelectedOptionsDataSet);
      }, 3000);
    });
  },
  getSelectedOptions: (selectedValue) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          asyncSelectedOptionsDataSet.filter(({ value }) => {
            return selectedValue.includes(value);
          })
        );
      }, 3000);
    });
  },
  value: ['6'],
  multiple: true,
  labelWrapped: true,
  required: true,
} as DataDropdownFieldProps;

export const WithEndAdornment = Template.bind({});
WithEndAdornment.args = {
  label: 'Dropdown With Options',
  required: true,
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
  startAdornment: <Typography variant="body2">To</Typography>,
  endAdornment: (
    <Stack
      direction="row"
      sx={{
        gap: 0.5,
      }}
    >
      <Typography variant="body2">Cc</Typography>
      <Typography variant="body2">Bcc</Typography>
    </Stack>
  ),
} as DataDropdownFieldProps;

export const WithPlaceholderOption = Template.bind({});
WithPlaceholderOption.args = {
  label: 'Dropdown With Options',
  required: true,
  options: ['One', 'Two', 'Three'].map((value) => ({ label: value, value })),
  placeholderOption: {
    label: (
      <FieldValue icon={<ProfileGravatar size={20} />}>Placeholder</FieldValue>
    ),
  },
} as DataDropdownFieldProps;
