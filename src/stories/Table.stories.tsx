import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Table } from '../components';

export default {
  title: 'Components/Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = ({
  showHeaderRow,
  paging,
  HeaderRowProps,
  columns,
  rows,
}) => {
  const props: any = {};
  showHeaderRow != null && (props.showHeaderRow = showHeaderRow);
  paging != null && (props.paging = paging);
  HeaderRowProps != null && (props.HeaderRowProps = HeaderRowProps);
  columns != null && (props.columns = columns);
  rows != null && (props.rows = rows);

  return (
    <Box sx={{ maxWidth: 1200, p: 3, mx: 'auto' }}>
      <Table
        variant="stripped"
        columns={[
          { id: 'accountNumber', label: 'Account Number' },
          { id: 'name', label: 'Status' },
          {
            id: 'outstandingBalance',
            label: 'Balance',
            align: 'right',
          },
        ]}
        rows={Array.from({ length: 3 }).map(() => ({
          accountNumber: (
            <Typography variant="body2" noWrap>
              18728
            </Typography>
          ),
          name: (
            <Typography variant="body2" noWrap>
              John Doe
            </Typography>
          ),
          outstandingBalance: (
            <Typography variant="body2" noWrap>
              660,000.00
            </Typography>
          ),
        }))}
        {...props}
      />
    </Box>
  );
};

export const Default = Template.bind({});

export const WithoutPaging = Template.bind({});
WithoutPaging.args = {
  paging: false,
};

export const WithoutHeaderRow = Template.bind({});
WithoutHeaderRow.args = {
  showHeaderRow: false,
};

export const WithHeaderRowProps = Template.bind({});
WithHeaderRowProps.args = {
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
};

export const ColumnTypes = Template.bind({});
ColumnTypes.args = {
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
};
