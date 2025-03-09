import { Meta, StoryFn } from '@storybook/react';
import { addSeconds } from 'date-fns';
import { LoremIpsum } from 'lorem-ipsum';
import randomEmail from 'random-email';
import React, { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { names, uniqueNamesGenerator } from 'unique-names-generator';

import NotificationsList, {
  Notification,
  NotificationsListProps,
} from '../components/NotificationsList';
import { INDEX_PAGE_ROUTE_PATH } from '../route-paths';

export default {
  title: 'Components/Notifications List',
  component: NotificationsList,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof NotificationsList>;

const lorem = new LoremIpsum();

const Template: StoryFn<typeof NotificationsList> = (props) => {
  return (
    <NotificationsList
      {...props}
      sx={{
        width: 400,
      }}
    />
  );
};

const sampleNotifications: Notification[] = [
  ...Array.from({ length: 4 }).map(() => {
    return {
      isRead: false,
      timestamp: addSeconds(new Date(), -Math.round(Math.random() * 200000)),
    };
  }),
  ...Array.from({ length: 5 }).map(() => {
    return {
      isRead: true,
      timestamp: addSeconds(new Date(), -Math.round(Math.random() * 200000)),
    };
  }),
]
  .sort(({ timestamp: aTimeStamp }, { timestamp: bTimeStamp }) => {
    return bTimeStamp.getTime() - aTimeStamp.getTime();
  })
  .map((notification) => {
    return {
      ...notification,
      message: lorem.generateWords(10 + Math.round(Math.random() * 10)),
      ProfileGravatarProps: {
        email: randomEmail(),
        label: uniqueNamesGenerator({
          dictionaries: [names, names],
          separator: ' ',
        }),
        defaultAvatar: 'highContrastHueShiftingIntials',
        defaultGravatar: 'robohash',
      },
      ...(() => {
        if (Math.random() > 0.5) {
          return {
            MessageImageProps: {
              src: `https://picsum.photos/seed/${lorem.generateWords(1)}/60/38`,
              alt: 'Random image',
            },
          };
        }
      })(),
      component: forwardRef<HTMLAnchorElement, any>(function ParentLink(
        linkProps,
        ref
      ) {
        return (
          <RouterLink ref={ref} to={INDEX_PAGE_ROUTE_PATH} {...linkProps} />
        );
      }),
    };
  });

export const Default = Template.bind({});
Default.args = {
  notifications: sampleNotifications,
} as NotificationsListProps;
