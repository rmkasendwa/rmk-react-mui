import { ComponentMeta, ComponentStory } from '@storybook/react';
import randomEmail from 'random-email';
import createMobilePhoneNumber from 'random-mobile-numbers';
import React from 'react';
import {
  animals,
  colors,
  starWars,
  uniqueNamesGenerator,
} from 'unique-names-generator';

import EnumValueChip from '../components/EnumValueChip';
import RecordsExplorer, {
  RecordsExplorerProps,
} from '../components/RecordsExplorer';

export default {
  title: 'Components/Records Explorer',
  component: RecordsExplorer,
} as ComponentMeta<typeof RecordsExplorer>;

const Template: ComponentStory<typeof RecordsExplorer> = (props) => (
  <RecordsExplorer {...props} />
);

const contactStatus = ['Active', 'Pending'] as const;
type ContactStatus = typeof contactStatus[number];

const contactSources = [
  'Refferal',
  'Website',
  'Google Search',
  'Trip',
] as const;
type ContactSource = typeof contactSources[number];

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  status: ContactStatus;
  email: string;
  accountBalance: number;
  source: ContactSource;
};

const dataSet = Array.from({ length: 1000 }).map((_, index) => {
  return {
    id: String(index),
    name: uniqueNamesGenerator({
      dictionaries: [starWars, colors, animals],
    }),
    phoneNumber: createMobilePhoneNumber('UK'),
    status: ['Active', 'Pending'][Math.floor(Math.random() * 2)],
    email: randomEmail(),
    accountBalance: Math.round(Math.random() * 1000_000),
    source: contactSources[Math.floor(Math.random() * contactSources.length)],
  } as Contact;
});

const baseArgs = {
  data: dataSet,
  views: [
    {
      type: 'List',
      columns: [
        { id: 'name', label: 'Name' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          width: 100,
          getColumnValue: ({ status }) => {
            return (
              <EnumValueChip
                value={status}
                colors={{
                  Active: '#3fb950',
                  Pending: '#ffa657',
                }}
              />
            );
          },
        },
        { id: 'source', label: 'Source', type: 'enum' },
        { id: 'phoneNumber', label: 'Phone Number', type: 'phoneNumber' },
        { id: 'email', label: 'Email', type: 'email' },
        {
          id: 'accountBalance',
          label: 'Account Balance',
          type: 'currency',
          width: 200,
        },
      ],
    },
    {
      type: 'Timeline',
    },
  ],
  recordLabelPlural: 'Contacts',
} as RecordsExplorerProps<typeof dataSet[number]>;

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
  title: 'Contacts',
} as RecordsExplorerProps;

export const WithLoadFunction = Template.bind({});
WithLoadFunction.args = {
  ...baseArgs,
  load: () => {
    console.log('Loading...');
  },
} as RecordsExplorerProps;
