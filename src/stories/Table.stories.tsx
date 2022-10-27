import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import uniqid from 'uniqid';

import Table, { TableProps } from '../components/Table';

export default {
  title: 'Components/Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = (props) => {
  return (
    <Box sx={{ height: '100vh' }}>
      <Table variant="stripped" {...props} />
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  columns: [
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'id',
      width: 160,
    },
    { id: 'name', label: 'Name' },
    {
      id: 'outstandingBalance',
      label: 'Balance',
      type: 'currency',
    },
  ],
  rows: Array.from({ length: 3 }).map((_, index) => ({
    id: index,
    accountNumber: '18728',
    name: 'John Doe',
    outstandingBalance: 660000,
  })),
  paging: false,
} as TableProps;

export const WithoutPaging = Template.bind({});
WithoutPaging.args = {
  columns: [
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'id',
      width: 160,
    },
    { id: 'name', label: 'Name' },
    {
      id: 'outstandingBalance',
      label: 'Balance',
      type: 'currency',
    },
  ],
  rows: Array.from({ length: 3 }).map((_, index) => ({
    id: index,
    accountNumber: '18728',
    name: 'John Doe',
    outstandingBalance: 660000,
  })),
  paging: false,
} as TableProps;

export const WithoutHeaderRow = Template.bind({});
WithoutHeaderRow.args = {
  columns: [
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'id',
      width: 160,
    },
    { id: 'name', label: 'Name' },
    {
      id: 'outstandingBalance',
      label: 'Balance',
      type: 'currency',
    },
  ],
  rows: Array.from({ length: 3 }).map((_, index) => ({
    id: index,
    accountNumber: '18728',
    name: 'John Doe',
    outstandingBalance: 660000,
  })),
  showHeaderRow: false,
} as TableProps;

export const WithHeaderRowProps = Template.bind({});
WithHeaderRowProps.args = {
  columns: [
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'id',
      width: 160,
    },
    { id: 'name', label: 'Name' },
    {
      id: 'outstandingBalance',
      label: 'Balance',
      type: 'currency',
    },
  ],
  rows: Array.from({ length: 3 }).map((_, index) => ({
    id: index,
    accountNumber: '18728',
    name: 'John Doe',
    outstandingBalance: 660000,
  })),
  HeaderRowProps: {
    sx: {
      textTransform: 'none',
      '&>th': {
        color: '#fff',
        backgroundColor: '#333',
        py: 0,
      },
      '&>th>p': {
        lineHeight: '40px',
      },
    },
  },
} as TableProps;

export const ColumnTypes = Template.bind({});
ColumnTypes.args = {
  columns: [
    { id: 'id', label: 'id', type: 'id' },
    { id: 'amount', label: 'Currency', type: 'currency' },
    { id: 'number', label: 'Number', type: 'number' },
    { id: 'percent', label: 'Percent', type: 'percentage' },
    { id: 'time', label: 'Time', type: 'time' },
    { id: 'isHere', label: 'Boolean', type: 'boolean' },
  ],
  rows: Array.from({ length: 4 + Math.round(Math.random() * 100) }).map(() => {
    return {
      id: uniqid(),
      amount: Math.round(Math.random() * 5000) * 500,
      number: Math.round(Math.random() * 10000),
      percent: Math.random() * 100,
      isHere: Math.round(Math.random() * 10) % 2 === 0,
      time: Date.now(),
    };
  }),
  columnTypographyProps: {
    noWrap: true,
  },
} as TableProps;

export const ClassicPagination = Template.bind({});
ClassicPagination.args = {
  columns: [
    { id: 'id', label: 'id', type: 'id' },
    { id: 'amount', label: 'Currency', type: 'currency' },
    { id: 'number', label: 'Number', type: 'number' },
    { id: 'percent', label: 'Percent', type: 'percentage' },
    { id: 'isHere', label: 'Boolean', type: 'boolean' },
  ],
  rows: Array.from({ length: 4 + Math.round(Math.random() * 100) }).map(() => {
    return {
      id: Math.round(Math.random() * 500),
      amount: Math.round(Math.random() * 5000) * 500,
      number: Math.round(Math.random() * 10000),
      percent: Math.random() * 100,
      isHere: Math.round(Math.random() * 10) % 2 === 0,
    };
  }),
  paginationType: 'classic',
} as TableProps;

export const FixedHeader = Template.bind({});
FixedHeader.args = {
  columns: [
    { id: 'id', label: 'id', type: 'id' },
    { id: 'amount', label: 'Currency', type: 'currency' },
    { id: 'number', label: 'Number', type: 'number' },
    { id: 'percent', label: 'Percent', type: 'percentage' },
    { id: 'isHere', label: 'Boolean', type: 'boolean' },
  ],
  rows: Array.from({ length: 4 + Math.round(Math.random() * 100) }).map(() => {
    return {
      id: uniqid(),
      amount: Math.round(Math.random() * 5000) * 500,
      number: Math.round(Math.random() * 10000),
      percent: Math.random() * 100,
      isHere: Math.round(Math.random() * 10) % 2 === 0,
    };
  }),
  paging: false,
  stickyHeader: true,
  sx: {
    height: '100%',
  },
} as TableProps;

export const WithDynamicRowData = Template.bind({});
WithDynamicRowData.args = {
  columns: [
    { id: 'id', label: 'id', type: 'id' },
    {
      id: 'amount',
      label: 'Currency',
      type: 'currency',
      onClickColumn: (row) => {
        console.log({ row });
      },
    },
    { id: 'number', label: 'Number', type: 'number' },
    { id: 'percent', label: 'Percent', type: 'percentage' },
    { id: 'isHere', label: 'Boolean', type: 'boolean' },
  ],
  rows: Array.from({ length: 4 + Math.round(Math.random() * 100) }).map(() => {
    return {
      id: uniqid(),
      amount: Math.round(Math.random() * 5000) * 500,
      number: Math.round(Math.random() * 10000),
      percent: Math.random() * 100,
      isHere: Math.round(Math.random() * 10) % 2 === 0,
    };
  }),
  generateRowData: (account: any) => {
    return {
      number: (
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ color: 'green' }}>
            $$$
          </Box>
          &nbsp;
          {account.number}
        </Box>
      ),
    };
  },
  paging: false,
  stickyHeader: true,
  sx: {
    height: '100%',
  },
} as TableProps;
