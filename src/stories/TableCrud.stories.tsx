import { Box } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import TableCrud, { TableCrudProps } from '../components/TableCrud';
import { contactTableProps, contacts, tableColumns } from './data/contacts';

export default {
  title: 'Components/Table Crud',
  component: TableCrud,
} as Meta<typeof TableCrud>;

const Template: StoryFn<typeof TableCrud> = (props) => {
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

const baseArgs = {
  ...contactTableProps,
  columns: tableColumns,
  title: 'Contacts',
  recordsFinder: async ({ limit = 100, offset = 0, searchTerm }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredOptions = contacts.filter(({ name }) => {
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
} as TableCrudProps<(typeof contacts)[number]>;

export const Default = Template.bind({});
Default.args = {
  ...baseArgs,
} as TableCrudProps<(typeof contacts)[number]>;
