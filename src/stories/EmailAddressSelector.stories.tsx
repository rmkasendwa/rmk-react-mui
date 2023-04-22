import '@infinite-debugger/rmk-js-extensions/String';

import Container from '@mui/material/Container';
import { Meta, StoryFn } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import randomEmail from 'random-email';
import React from 'react';

import EmailAddressSelector, {
  EmailAddressHolder,
  EmailAddressSelectorProps,
} from '../components/EmailAddressSelector';

export default {
  title: 'Components/Email Address Selector',
  component: EmailAddressSelector,
} as Meta<typeof EmailAddressSelector>;

const lorem = new LoremIpsum();

const Template: StoryFn<typeof EmailAddressSelector> = (props) => (
  <Container maxWidth="lg" sx={{ p: 3 }}>
    <EmailAddressSelector {...props} />
  </Container>
);

export const Default = Template.bind({});
Default.args = {
  startAdornment: 'To',
} as EmailAddressSelectorProps;

const emailAddressHolders = Array.from({ length: 50 }).map(() => {
  const email = randomEmail();
  return {
    name: lorem.generateWords(2),
    email,
  } as EmailAddressHolder;
});

export const WithEmailAddressSearchPool = Template.bind({});
WithEmailAddressSearchPool.args = {
  startAdornment: 'To',
  getEmailAddressHolders: async ({ searchTerm, offset = 0, limit = 10 }) => {
    return emailAddressHolders
      .filter(({ email, name }) => {
        return [email, name].some((label) => {
          return String(label)
            .toLowerCase()
            .match(String(searchTerm).toLowerCase());
        });
      })
      .slice(offset, offset + limit);
  },
} as EmailAddressSelectorProps;
