import PhoneIcon from '@mui/icons-material/Phone';
import ShareIcon from '@mui/icons-material/Share';
import { countries } from 'countries-list';
import randomEmail from 'random-email';
import createMobilePhoneNumber from 'random-mobile-numbers';
import React from 'react';
import { names, uniqueNamesGenerator } from 'unique-names-generator';

import CountryFieldValue from '../../components/CountryFieldValue';
import EnumValueChip from '../../components/EnumValueChip';
import FieldValue from '../../components/FieldValue';
import ProfileGravatar from '../../components/ProfileGravatar';
import { TableColumn, TableProps } from '../../components/Table';
import { CountryCode } from '../../interfaces/Countries';

const countryCodes = Object.keys(countries) as CountryCode[];

const contactStatuses = ['Active', 'Pending'] as const;
type ContactStatus = typeof contactStatuses[number];

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
  countryCode: CountryCode;
};

export const contacts = Array.from({ length: 1000 }).map((_, index) => {
  return {
    id: String(index),
    name: uniqueNamesGenerator({
      dictionaries: [names, names],
      separator: ' ',
    }),
    phoneNumber: createMobilePhoneNumber('UK'),
    status:
      contactStatuses[Math.floor(Math.random() * (contactStatuses.length + 1))],
    email: randomEmail(),
    accountBalance: Math.round(Math.random() * 1000_000),
    source: contactSources[Math.floor(Math.random() * contactSources.length)],
    countryCode: countryCodes[Math.floor(Math.random() * countryCodes.length)],
  } as Contact;
});

export const tableColumns: TableColumn<Contact>[] = [
  {
    id: 'name',
    label: 'Name',
    getColumnValue: ({ name, email }) => {
      return (
        <FieldValue
          icon={
            <ProfileGravatar
              size={20}
              email={email}
              label={name}
              defaultAvatar="highContrastHueShiftingIntials"
              defaultGravatar="robohash"
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
      if (status) {
        return (
          <EnumValueChip
            value={status}
            colors={{
              Active: '#1F8D60',
              Pending: '#C31521',
            }}
          />
        );
      }
    },
  },
  {
    id: 'countryCode',
    label: 'Country',
    type: 'enum',
    getColumnValue: ({ countryCode }) => {
      return (
        <CountryFieldValue
          {...{ countryCode }}
          countryLabel={countries[countryCode].name}
        />
      );
    },
    getFilterValue: ({ countryCode }) => {
      return countries[countryCode].name;
    },
  },
  { id: 'phoneNumber', label: 'Phone Number', type: 'phoneNumber' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'source', label: 'Source', type: 'enum', width: 140 },
  {
    id: 'accountBalance',
    label: 'Account Balance',
    type: 'currency',
    width: 200,
  },
];

export const contactTableProps = {
  getEllipsisMenuToolProps: () => {
    return {
      options: [
        { label: 'Call', icon: <PhoneIcon />, value: 'Call' },
        { label: 'Share', icon: <ShareIcon />, value: 'Share' },
      ],
    };
  },
  minColumnWidth: 220,
} as Partial<TableProps<Contact>>;
