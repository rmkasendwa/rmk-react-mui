import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import TooltipPopupButton, {
  TooltipPopupButtonProps,
} from '../components/TooltipPopupButton';

export default {
  title: 'Components/Tooltip Popup Button',
  component: TooltipPopupButton,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof TooltipPopupButton>;

const Template: StoryFn<typeof TooltipPopupButton> = (props) => (
  <TooltipPopupButton {...props} />
);

export const Default = Template.bind({});
Default.args = {
  children: 'Click me',
  title: 'This is a tooltip',
} as TooltipPopupButtonProps;
