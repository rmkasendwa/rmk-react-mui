import Container from '@mui/material/Container';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import FullPageTable, {
  IFullPageTableProps,
} from '../components/FullPageTable';

export default {
  title: 'Components/Full Page Table',
  component: FullPageTable,
} as ComponentMeta<typeof FullPageTable>;

const Template: ComponentStory<typeof FullPageTable> = (props) => (
  <Container maxWidth="lg" sx={{ p: 3 }}>
    <FullPageTable {...props} />
  </Container>
);

export const Default = Template.bind({});
Default.args = {
  columns: [
    {
      id: 'accountNumber',
      label: 'Account Number',
      width: 180,
    },
    { id: 'name', label: 'Name' },
    {
      id: 'outstandingBalance',
      label: 'Balance',
      type: 'currency',
    },
  ],
  rows: Array.from({ length: 3 }).map(() => ({
    accountNumber: '18728',
    name: 'John Doe',
    outstandingBalance: 660000,
  })),
} as IFullPageTableProps;
