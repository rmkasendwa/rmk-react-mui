import LandscapeIcon from '@mui/icons-material/Landscape';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import List, { ListProps } from '@mui/material/List';
import ListItem, { ListItemProps } from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Fragment, ReactNode, forwardRef } from 'react';

import ProfileGravatar, { ProfileGravatarProps } from './ProfileGravatar';
import TimeStampDisplay from './TimeStampDisplay';

export interface NotificationsListClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type NotificationsListClassKey = keyof NotificationsListClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiNotificationsList: NotificationsListProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiNotificationsList: keyof NotificationsListClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiNotificationsList?: {
      defaultProps?: ComponentsProps['MuiNotificationsList'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiNotificationsList'];
      variants?: ComponentsVariants['MuiNotificationsList'];
    };
  }
}
//#endregion

export const getNotificationsListUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiNotificationsList', slot);
};

const slots: Record<NotificationsListClassKey, [NotificationsListClassKey]> = {
  root: ['root'],
};

export const notificationsListClasses: NotificationsListClasses =
  generateUtilityClasses(
    'MuiNotificationsList',
    Object.keys(slots) as NotificationsListClassKey[]
  );

const unreadNotificationStyles: ListItemProps['sx'] = {
  bgcolor: 'rgba(0,58,204,0.06)',
};
const readNotificationStyles: ListItemProps['sx'] = {};

export interface Notification {
  message: ReactNode;
  timestamp: number | string | Date;
  ProfileGravatarProps?: Partial<ProfileGravatarProps>;
  MessageImageProps?: Partial<AvatarProps>;
  isRead?: boolean;
}

export interface NotificationsListProps extends ListProps {
  notifications?: Notification[];
}

export const NotificationsList = forwardRef<
  HTMLUListElement,
  NotificationsListProps
>(function NotificationsList(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiNotificationsList' });
  const { className, notifications = [], sx, ...rest } = props;

  const classes = composeClasses(
    slots,
    getNotificationsListUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  return (
    <List
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        width: '100%',
        p: 0,
        ...sx,
      }}
    >
      {(() => {
        if (notifications.length > 0) {
          return notifications.map(
            (
              {
                isRead,
                message,
                timestamp,
                ProfileGravatarProps = {},
                MessageImageProps = {},
              },
              index
            ) => {
              const {
                sx: ProfileGravatarPropsSx,
                ...ProfileGravatarPropsRest
              } = ProfileGravatarProps;
              const { sx: MessageImagePropsSx, ...MessageImagePropsRest } =
                MessageImageProps;
              const avatar = (
                <ProfileGravatar
                  variant="circular"
                  {...ProfileGravatarPropsRest}
                  sx={{
                    ...ProfileGravatarPropsSx,
                    width: 40,
                    height: 40,
                    ml: 2,
                  }}
                />
              );
              return (
                <Fragment key={index}>
                  {index > 0 ? (
                    <Divider variant="inset" component="li" sx={{ mx: 0 }} />
                  ) : null}
                  <ListItem
                    sx={{
                      alignItems: 'flex-start',
                      gap: 2,
                      py: 2,
                      ...(isRead
                        ? readNotificationStyles
                        : unreadNotificationStyles),
                    }}
                  >
                    <ListItemAvatar>
                      {isRead === false ? (
                        <Badge
                          overlap="circular"
                          variant="dot"
                          color="primary"
                          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                          sx={{
                            '.MuiBadge-badge': {
                              transform: 'translate(-9px, 10px)',
                            },
                          }}
                        >
                          {avatar}
                        </Badge>
                      ) : (
                        avatar
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ m: 0 }}
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '0.75em',
                          }}
                        >
                          {message}
                        </Typography>
                      }
                      secondary={<TimeStampDisplay timestamp={timestamp} />}
                    />
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        {...MessageImagePropsRest}
                        sx={{
                          ...MessageImagePropsSx,
                          width: 60,
                          height: 38,
                        }}
                      >
                        <LandscapeIcon />
                      </Avatar>
                    </ListItemAvatar>
                  </ListItem>
                </Fragment>
              );
            }
          );
        }
        return (
          <ListItem
            sx={{
              py: 1,
              px: isSmallScreenSize ? 2 : 3,
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body2">
                  You have no new notifications.
                </Typography>
              }
            />
          </ListItem>
        );
      })()}
    </List>
  );
});

export default NotificationsList;
