import { ComponentMeta, ComponentStory } from '@storybook/react';
import randomEmail from 'random-email';
import createMobilePhoneNumber from 'random-mobile-numbers';
import React from 'react';
import { starWars, uniqueNamesGenerator } from 'unique-names-generator';

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

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'Active' | 'Pending';
  email: string;
};

const dataSet = Array.from({ length: 500 }).map((_, index) => {
  return {
    id: String(index),
    name: uniqueNamesGenerator({
      dictionaries: [starWars],
    }),
    phoneNumber: createMobilePhoneNumber('UK'),
    status: ['Active', 'Pending'][Math.floor(Math.random() * 2)],
    email: randomEmail(),
  } as Contact;
});

export const Default = Template.bind({});
Default.args = {
  data: dataSet,
  views: [
    {
      type: 'List',
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'status', label: 'Status', type: 'enum', width: 100 },
        { id: 'phoneNumber', label: 'Phone Number', type: 'phoneNumber' },
        { id: 'email', label: 'Email', type: 'email' },
      ],
    },
  ],
  recordLabelPlural: 'Contacts',
} as RecordsExplorerProps;
