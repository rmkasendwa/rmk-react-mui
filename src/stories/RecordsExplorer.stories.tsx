import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MapIcon from '@mui/icons-material/Map';
import { Box, Grid, Typography } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import { countries } from 'countries-list';
import React from 'react';

import CountryFieldValue from '../components/CountryFieldValue';
import EnumValueChip from '../components/EnumValueChip';
import FormikCurrencyInputField from '../components/FormikInputFields/FormikCurrencyInputField';
import FormikDataDropdownField from '../components/FormikInputFields/FormikDataDropdownField';
import FormikPhoneNumberInputField from '../components/FormikInputFields/FormikPhoneNumberInputField';
import FormikTextField from '../components/FormikInputFields/FormikTextField';
import RecordsExplorer, {
  RecordsExplorerProps,
} from '../components/RecordsExplorer';
import {
  contactSources,
  contactStatuses,
  contactTableProps,
  contacts,
  countryCodes,
  createContactFormValidationSchema,
  tableColumns,
} from './data/contacts';

export default {
  title: 'Components/Records Explorer',
  component: RecordsExplorer,
} as Meta<typeof RecordsExplorer>;

const Template: StoryFn<typeof RecordsExplorer> = (props) => (
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
      startDateProperty: 'joinedAt',
      endDateProperty: 'leftAt',
      getTimelineElements: ({ joinedAt, leftAt }) => {
        return [
          {
            startDate: joinedAt,
            endDate: leftAt,
          },
        ];
      },
      mergeTools: true,
    },
  ],
  recordLabelPlural: 'Contacts',
} as RecordsExplorerProps<(typeof contacts)[number]>;

export const Default = Template.bind({});
Default.args = {
  ...baseArgs,
} as RecordsExplorerProps;

export const Timeline = Template.bind({});
Timeline.args = {
  ...baseArgs,
  selectedView: 'Timeline',
} as RecordsExplorerProps;

export const WithExtraViewOptions = Template.bind({});
WithExtraViewOptions.args = {
  ...baseArgs,
  ViewOptionsButtonProps: {
    viewOptions: [
      {
        label: 'Map',
        icon: <MapIcon />,
      },
      {
        label: 'Heat Map',
        icon: <LocalFireDepartmentIcon />,
      },
    ],
  },
  children: ({ selectedView, data }) => {
    switch (selectedView) {
      case 'Map':
        return (
          <Box>
            <Typography>Map</Typography>
            {JSON.stringify(data)}
          </Box>
        );
      case 'Heat Map':
        return (
          <Box>
            <Typography>Heat Map</Typography>
            {JSON.stringify(data)}
          </Box>
        );
    }
  },
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
  validationSchema: createContactFormValidationSchema,
  initialValues: {
    name: '',
    status: undefined as any,
    countryCode: undefined as any,
    phoneNumber: '',
    email: '',
    source: undefined as any,
    accountBalance: undefined as any,
  },
  editorForm: (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormikTextField label="Name" name="name" fullWidth required />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikDataDropdownField
          options={contactStatuses.map((status) => {
            return {
              label: (
                <EnumValueChip
                  value={status}
                  colors={{
                    Active: '#1F8D60',
                    Pending: '#C31521',
                  }}
                />
              ),
              searchableLabel: status,
              value: status,
            };
          })}
          label="Status"
          name="status"
          fullWidth
        />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikDataDropdownField
          options={countryCodes.map((countryCode) => {
            return {
              label: <CountryFieldValue countryCode={countryCode} />,
              searchableLabel: countries[countryCode].name,
              value: countryCode,
            };
          })}
          label="Country"
          name="countryCode"
          fullWidth
          required
        />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikPhoneNumberInputField
          label="Phone Number"
          name="phoneNumber"
          fullWidth
          required
        />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikTextField label="Email" name="email" fullWidth required />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikDataDropdownField
          options={contactSources.map((source) => {
            return {
              label: source,
              searchableLabel: source,
              value: source,
            };
          })}
          label="Source"
          name="source"
          fullWidth
          required
        />
      </Grid>
      <Grid item sm={6} xs={12}>
        <FormikCurrencyInputField
          label="Account Balance"
          name="accountBalance"
          fullWidth
        />
      </Grid>
    </Grid>
  ),
  recordCreator: async (formValues) => {
    console.log('To be created', { formValues });
    return new Promise((resolve) => {
      setTimeout(() => resolve(formValues), 3000);
    });
  },
  recordEditor: async (record, formValues) => {
    console.log('To be edited', { record, formValues });
    return new Promise((resolve) => {
      setTimeout(() => resolve(formValues), 3000);
    });
  },
  recordDeletor: async (record) => {
    console.log('To be deleted', { record });
    return new Promise((resolve) => {
      setTimeout(() => resolve(record), 3000);
    });
  },
} as RecordsExplorerProps;

export const WithDataPresets = Template.bind({});
WithDataPresets.args = {
  ...baseArgs,
  dataPresets: [
    {
      title: 'All Contacts',
      recordsFinder: async () => {
        return contacts;
      },
    },
    {
      title: 'Active Contacts',
      recordsFinder: async () => {
        return contacts.filter(({ status }) => {
          return status === 'Active';
        });
      },
    },
    {
      title: 'Contacts From Website',
      recordsFinder: async () => {
        return contacts.filter(({ source }) => {
          return source === 'Website';
        });
      },
      key: 'website-contacts',
    },
  ],
} as RecordsExplorerProps;
