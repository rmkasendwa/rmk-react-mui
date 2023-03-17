import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import RecordsExplorer, {
  RecordsExplorerProps,
} from '../components/RecordsExplorer';
import { contactTableProps, contacts, tableColumns } from './data/contacts';

export default {
  title: 'Components/Records Explorer',
  component: RecordsExplorer,
} as ComponentMeta<typeof RecordsExplorer>;

const Template: ComponentStory<typeof RecordsExplorer> = (props) => (
  <RecordsExplorer {...props} />
);

const baseArgs = {
  data: contacts,
  views: [
    {
      type: 'List',
      columns: tableColumns,
      ...contactTableProps,
    },
    {
      type: 'Timeline',
    },
  ],
  recordLabelPlural: 'Contacts',
} as RecordsExplorerProps<typeof contacts[number]>;

export const Default = Template.bind({});
Default.args = {
  ...baseArgs,
} as RecordsExplorerProps;

export const Timeline = Template.bind({});
Timeline.args = {
  ...baseArgs,
  view: 'Timeline',
} as RecordsExplorerProps;

export const WithDefaultGroupByOption = Template.bind({});
WithDefaultGroupByOption.args = {
  ...baseArgs,
  groupBy: [{ id: 'status' }],
} as RecordsExplorerProps;

export const WithDefaultSortByOption = Template.bind({});
WithDefaultSortByOption.args = {
  ...baseArgs,
  sortBy: [{ id: 'name' }],
} as RecordsExplorerProps;

export const WithDefaultMultipleSortFields = Template.bind({});
WithDefaultMultipleSortFields.args = {
  ...baseArgs,
  sortBy: [{ id: 'name' }, { id: 'status', sortDirection: 'DESC' }],
} as RecordsExplorerProps;

export const WithDefaultFilterFormula = Template.bind({});
WithDefaultFilterFormula.args = {
  ...baseArgs,
  filterBy: {
    conditions: [
      { fieldId: 'name', operator: 'contains', value: 'ad' },
      { fieldId: 'status', operator: 'is', value: 'Pending' },
    ],
  },
} as RecordsExplorerProps;

export const WithPathToAddNew = Template.bind({});
WithPathToAddNew.args = {
  ...baseArgs,
  pathToAddNew: '/contacts/new',
} as RecordsExplorerProps;

export const WithTitle = Template.bind({});
WithTitle.args = {
  ...baseArgs,
  pathToAddNew: '/contacts/new',
  title: 'All Contacts',
} as RecordsExplorerProps;

export const WithDynamicTitle = Template.bind({});
WithDynamicTitle.args = {
  ...baseArgs,
  pathToAddNew: '/contacts/new',
  getTitle: ({ filterBy, selectedView }) => {
    const titleParts = ['Contacts'];
    if (filterBy) {
      titleParts.unshift('Filtered');
    }
    titleParts.push(selectedView);

    return titleParts.join(' ');
  },
} as RecordsExplorerProps;

export const WithLoadFunction = Template.bind({});
WithLoadFunction.args = {
  ...baseArgs,
  load: () => {
    console.log('Loading...');
  },
} as RecordsExplorerProps;

export const WithCrudFunctions = Template.bind({});
WithCrudFunctions.args = {
  ...baseArgs,
  validationSchema: {},
  initialValues: {},
  editorForm: <Box>Add form here</Box>,
  recordCreator: async (formValues) => {
    console.log('To be created', { formValues });
  },
  recordEditor: async (record, formValues) => {
    console.log('To be edited', { record, formValues });
  },
  recordDeletor: async (record) => {
    console.log('To be deleted', { record });
  },
} as RecordsExplorerProps;
