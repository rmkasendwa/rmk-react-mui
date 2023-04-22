import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import UnderConstruction from '../components/UnderConstruction';

export default {
  title: 'Components/Under Construction',
  component: UnderConstruction,
} as Meta<typeof UnderConstruction>;

const Template: StoryFn<typeof UnderConstruction> = (props) => (
  <UnderConstruction {...props} />
);

export const Default = Template.bind({});
