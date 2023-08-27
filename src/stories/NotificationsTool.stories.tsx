import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import NotificationsTool, {
  NotificationsToolProps,
} from '../components/NotificationsTool';

export default {
  title: 'Components/Notifications Tool',
  component: NotificationsTool,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof NotificationsTool>;

const Template: StoryFn<typeof NotificationsTool> = (props) => {
  return <NotificationsTool {...props} />;
};

export const Default = Template.bind({});
Default.args = {} as NotificationsToolProps;
