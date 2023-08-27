import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

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

export interface NotificationsToolProps extends IconButtonProps {}

export const NotificationsTool = forwardRef<
  HTMLButtonElement,
  NotificationsToolProps
>(function NotificationsTool(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiNotificationsTool' });
  const { className, ...rest } = props;

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

  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };
  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <IconButton
        ref={mergeRefs([ref, anchorRef])}
        {...rest}
        className={clsx(classes.root)}
        onClick={handleMenuToggle}
      >
        <Badge color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popper
        open={menuOpen}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-end"
        disablePortal
      >
        {({ TransitionProps }) => {
          return (
            <Grow {...TransitionProps}>
              <Box>
                <ClickAwayListener onClickAway={handleMenuClose}>
                  <Card sx={{ width: 450 }} elevation={5}>
                    <CardHeader
                      title={
                        <Grid container alignItems="center">
                          <Grid item flex={1}>
                            <Typography
                              variant="h4"
                              component="h2"
                              sx={{ fontSize: 18 }}
                            >
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
                      }
                    />
                    <Divider />
                    <NotificationsList
                      sx={{
                        height: 'calc(100vh - 140px)',
                        maxHeight: 650,
                        overflowY: 'auto',
                      }}
                    />
                  </Card>
                </ClickAwayListener>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
});

export default NotificationsTool;
