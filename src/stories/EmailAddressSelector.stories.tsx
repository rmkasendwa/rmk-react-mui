import '@infinite-debugger/rmk-js-extensions/String';

import Container from '@mui/material/Container';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import EmailAddressSelector, {
  EmailAddressSelectorProps,
} from '../components/EmailAddressSelector';

export default {
  title: 'Components/Email Address Selector',
  component: EmailAddressSelector,
} as ComponentMeta<typeof EmailAddressSelector>;

const Template: ComponentStory<typeof EmailAddressSelector> = (props) => (
  <Container maxWidth="lg" sx={{ p: 3 }}>
    <EmailAddressSelector {...props} />
  </Container>
);

export const Default = Template.bind({});
Default.args = {
  startAdornment: 'To',
} as EmailAddressSelectorProps;
