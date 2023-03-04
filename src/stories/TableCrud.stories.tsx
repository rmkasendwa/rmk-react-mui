import { Box } from '@mui/material';
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
import FieldValue from '../components/FieldValue';
import ProfileGravatar from '../components/ProfileGravatar';
import TableCrud, { TableCrudProps } from '../components/TableCrud';

export default {
  title: 'Components/Table Crud',
  component: TableCrud,
} as ComponentMeta<typeof TableCrud>;

const Template: ComponentStory<typeof TableCrud> = (props) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        height: '100%',
      }}
    >
      <TableCrud {...props} />
    </Box>
  );
};

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
  columns: [
    {
      id: 'name',
      label: 'Contact',
      getColumnValue: ({ name, email }) => {
        return (
          <FieldValue
            icon={
              <ProfileGravatar
                size={20}
                email={email}
                label={name}
                defaultAvatar="highContrastHueShiftingIntials"
              />
            }
            variant="inherit"
            noWrap
            ContainerGridProps={{
              sx: {
                alignItems: 'center',
              },
            }}
          >
            {name}
          </FieldValue>
        );
      },
    },
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
  title: 'Contacts',
  recordsFinder: async ({ limit = 100, offset = 0, searchTerm }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredOptions = dataSet.filter(({ name }) => {
          return (
            !searchTerm ||
            String(name).toLowerCase().match(searchTerm.toLowerCase())
          );
        });
        resolve({
          records: filteredOptions.slice(offset, offset + limit),
          recordsTotalCount: filteredOptions.length,
        });
      }, 500);
    });
  },
  recordCreator: async (record) => {
    return record;
  },
  validationSchema: {},
  children: <Box>Form</Box>,
} as TableCrudProps<typeof dataSet[number]>;

export const Default = Template.bind({});
Default.args = {
  ...baseArgs,
} as TableCrudProps<typeof dataSet[number]>;
