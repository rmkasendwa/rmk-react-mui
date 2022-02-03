import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Table } from '../components';

export default {
  title: 'Components/Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = ({ showHeaderRow, paging }) => {
  const props: any = {};
  showHeaderRow != null && (props.showHeaderRow = showHeaderRow);
  paging != null && (props.paging = paging);

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
