import { ComponentMeta, ComponentStory } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';

import { DataDropdownField } from '../../components/InputFields/DataDropdownField';

export default {
  title: 'Components/Input Fields/Data Dropdown Field',
  component: DataDropdownField,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof DataDropdownField>;

const lorem = new LoremIpsum();

const Template: ComponentStory<typeof DataDropdownField> = (props) => {
  return (
    <DataDropdownField label="Dropdown" {...props} sx={{ minWidth: 300 }} />
  );
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
};

export const WithOverflowingOptions = Template.bind({});
WithOverflowingOptions.args = {
  label: 'Paginated Dropdown List',
  required: true,
  options: Array.from({ length: 200 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
};

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  label: 'Multiple Select',
  required: true,
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  SelectProps: {
    multiple: true,
  },
};

export const MultipleSelectWithValue = Template.bind({});
MultipleSelectWithValue.args = {
  label: 'Multiple Select With Value',
  required: true,
  options: Array.from({ length: 100 }).map((_, index) => ({
    label: `${index + 1}. ${lorem.generateWords(4)}`,
    value: index,
  })),
  value: [2, 5, 11],
  SelectProps: {
    multiple: true,
  },
};

export const WithSelectedOptionProp = Template.bind({});
WithSelectedOptionProp.args = {
  label: 'Custom Selected Option',
  required: true,
  selectedOption: {
    label: 'Selected Option',
    value: 'Selected Value',
  },
};

export const ListeningToSearchEvent = Template.bind({});
ListeningToSearchEvent.args = {
  label: 'Custom Selected Option',
  required: true,
  onChangeSearchTerm: (searchTerm) => {
    console.log(searchTerm);
  },
};
