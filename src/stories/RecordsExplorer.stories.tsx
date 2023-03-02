import { ComponentMeta, ComponentStory } from '@storybook/react';
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
};

const dataSet = Array.from({ length: 500 }).map((_, index) => {
  return {
    id: String(index),
    name: uniqueNamesGenerator({
      dictionaries: [starWars],
    }),
    phoneNumber: createMobilePhoneNumber('UK'),
    status: ['Active', 'Pending'][Math.floor(Math.random() * 1)],
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
        { id: 'phoneNumber', label: 'Phone Number', type: 'phoneNumber' },
        { id: 'status', label: 'Status' },
      ],
    },
  ],
  recordLabelPlural: 'Contacts',
} as RecordsExplorerProps;
