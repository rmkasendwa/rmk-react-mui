import '@infinite-debugger/rmk-js-extensions/String';

import Container from '@mui/material/Container';
import { ComponentMeta, ComponentStory } from '@storybook/react';
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
} as ComponentMeta<typeof EmailAddressSelector>;

const lorem = new LoremIpsum();

const Template: ComponentStory<typeof EmailAddressSelector> = (props) => (
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
  getEmailAddressHolders: async () => {
    return emailAddressHolders;
  },
} as EmailAddressSelectorProps;
