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

type ContactStatus = 'Active' | 'Pending';

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  status: ContactStatus;
  email: string;
  accountBalance: number;
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
