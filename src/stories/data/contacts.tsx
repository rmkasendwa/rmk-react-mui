import '../../components/FormikInputFields/FormikPhoneNumberInputField';

import PhoneIcon from '@mui/icons-material/Phone';
import ShareIcon from '@mui/icons-material/Share';
import { countries } from 'countries-list';
import randomEmail from 'random-email';
import createMobilePhoneNumber from 'random-mobile-numbers';
import React from 'react';
import { names, uniqueNamesGenerator } from 'unique-names-generator';
import * as Yup from 'yup';

import CountryFieldValue from '../../components/CountryFieldValue';
import EnumValueChip from '../../components/EnumValueChip';
import FieldValue from '../../components/FieldValue';
import ProfileGravatar from '../../components/ProfileGravatar';
import { TableColumn, TableProps } from '../../components/Table';
import { CountryCode } from '../../models/Countries';

export const countryCodes = Object.keys(countries) as CountryCode[];

export const contactStatuses = ['Active', 'Pending'] as const;
export type ContactStatus = (typeof contactStatuses)[number];

export const contactSources = [
  'Refferal',
  'Website',
  'Google Search',
  'Trip',
] as const;
export type ContactSource = (typeof contactSources)[number];

export type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  status: ContactStatus;
  email: string;
  accountBalance: number;
  source: ContactSource;
  countryCode: CountryCode;
  joinedAt?: string;
  leftAt?: string;
};

export const contacts = Array.from({ length: 1000 }).map((_, index) => {
  const joinedAtDate = new Date();
  const randomYearOffset = Math.floor(Math.random() * 10);
  joinedAtDate.setFullYear(joinedAtDate.getFullYear() + 5 - randomYearOffset);
  joinedAtDate.setMonth(Math.floor(Math.random() * 11));
  joinedAtDate.setDate(Math.floor(Math.random() * 28));

  const leftAtDate = new Date(joinedAtDate);
  leftAtDate.setFullYear(
    leftAtDate.getFullYear() + Math.floor(Math.random() * 3)
  );
  leftAtDate.setMonth(Math.floor(Math.random() * 11));
  leftAtDate.setDate(Math.floor(Math.random() * 28));

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
    ...(() => {
      if (Math.random() < 0.25) {
        return {
          joinedAt: joinedAtDate.toISOString(),
          leftAt: leftAtDate.toISOString(),
        };
      }
    })(),
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

export const createContactFormValidationSchema = Yup.object({
  name: Yup.string().required('Please enter the contact name'),
  status: Yup.mixed<ContactStatus>().oneOf([...contactStatuses]),
  countryCode: Yup.string().required('Please select the country'),
  phoneNumber: Yup.string()
    .phoneNumber()
    .required('Please enter the contact phone number'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Please enter the contact email address'),
  source: Yup.mixed<ContactSource>()
    .oneOf([...contactSources])
    .required('Please select the contact source'),
  accountBalance: Yup.number(),
});

// export const CreateContactFormValues = Yup.InferType<
//   typeof createContactFormValidationSchema
// >;
