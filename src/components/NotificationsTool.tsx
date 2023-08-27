import NotificationsIcon from '@mui/icons-material/Notifications';
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
import Badge, { BadgeProps } from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { usePopupTool } from '../hooks/Tools/PopupTool';
import NotificationsList from './NotificationsList';

export interface NotificationsToolClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type NotificationsToolClassKey = keyof NotificationsToolClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiNotificationsTool: NotificationsToolProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiNotificationsTool: keyof NotificationsToolClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiNotificationsTool?: {
      defaultProps?: ComponentsProps['MuiNotificationsTool'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiNotificationsTool'];
      variants?: ComponentsVariants['MuiNotificationsTool'];
    };
  }
}
//#endregion

export const getNotificationsToolUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiNotificationsTool', slot);
};

const slots: Record<NotificationsToolClassKey, [NotificationsToolClassKey]> = {
  root: ['root'],
};

export const notificationsToolClasses: NotificationsToolClasses =
  generateUtilityClasses(
    'MuiNotificationsTool',
    Object.keys(slots) as NotificationsToolClassKey[]
  );

export interface NotificationsToolProps extends IconButtonProps {
  notificationsCount?: number;
  BadgeProps?: Partial<BadgeProps>;
}

export const NotificationsTool = forwardRef<
  HTMLButtonElement,
  NotificationsToolProps
>(function NotificationsTool(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiNotificationsTool' });
  const { className, notificationsCount, BadgeProps, ...rest } = props;

  const classes = composeClasses(
    slots,
    getNotificationsToolUtilityClass,
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

  const {
    ref: anchorRef,
    icon,
    popupElement,
    onClick,
  } = usePopupTool({
    icon: (
      <Badge color="error" {...BadgeProps} badgeContent={notificationsCount}>
        <NotificationsIcon />
      </Badge>
    ),
    label: 'Notifications',
    popupCardTitle: (
      <Grid
        container
        sx={{
          alignItems: 'center',
          py: 1,
          px: isSmallScreenSize ? 2 : 3,
        }}
      >
        <Grid item flex={1}>
          <Typography variant="h4" component="h2" sx={{ fontSize: 18 }}>
            Notifications
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            variant="body2"
            sx={{ fontSize: 14, cursor: 'pointer' }}
            color="primary"
          >
            Clear all notifications
          </Typography>
        </Grid>
      </Grid>
    ),
    bodyContent: (
      <NotificationsList
        sx={{
          height: 'calc(100vh - 140px)',
          maxHeight: 650,
          overflowY: 'auto',
        }}
      />
    ),
    BodyContentProps: {
      sx: {
        '&,&:last-child': {
          py: 0,
        },
        px: 0,
      },
    },
  });

  return (
    <>
      <IconButton
        ref={mergeRefs([ref, anchorRef as any]) as any}
        {...rest}
        className={clsx(classes.root)}
        onClick={onClick}
      >
        {icon}
      </IconButton>
      {popupElement}
    </>
  );
});

export default NotificationsTool;
