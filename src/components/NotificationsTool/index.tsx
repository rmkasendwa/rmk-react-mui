import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import React, { useRef, useState } from 'react';

import NotificationsList from './NotificationsList';

interface INotificationsToolProps {}

const NotificationsTool: React.FC<INotificationsToolProps> = () => {
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
        size="large"
        ref={anchorRef}
        onClick={handleMenuToggle}
        color="inherit"
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
};

export default NotificationsTool;
