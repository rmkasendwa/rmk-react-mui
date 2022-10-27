import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import List, { ListProps } from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { CSSProperties, FC, Fragment } from 'react';

interface NotificationsListProps extends ListProps {}

const notifications: Array<{ isRead: boolean }> = [
  ...Array.from({ length: 4 }).map(() => {
    return { isRead: false };
  }),
  ...Array.from({ length: 5 }).map(() => {
    return { isRead: true };
  }),
];
const unreadNotificationStyles: CSSProperties = {
  backgroundColor: 'rgba(0,58,204,0.06)',
};
const readNotificationStyles: CSSProperties = {};

const NotificationsList: FC<NotificationsListProps> = ({ sx, ...rest }) => {
  return (
    <List
      {...rest}
      sx={{
        width: '100%',
        p: 0,
        ...sx,
      }}
    >
      {(() => {
        if (notifications.length > 0) {
          return notifications.map(({ isRead }, index) => {
            const avatar = (
              <Avatar
                alt="Notification Image"
                src={`https://loremflickr.com/160/160/avatar,face?random=${Math.round(
                  Math.random() * 1000
                )}`}
                sx={{ width: 52, height: 52, ml: 2, bgcolor: grey[300] }}
                variant="circular"
              />
            );
            return (
              <Fragment key={index}>
                {index === 0 || (
                  <Divider variant="inset" component="li" sx={{ mx: 0 }} />
                )}
                <ListItem
                  sx={{
                    alignItems: 'flex-start',
                    gap: 2,
                    pt: 2,
                    pb: 2,
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
                            transform: 'translate(-14px, 10px)',
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
                        Candidate &ldquo;<strong>Ronald M. Kasendwa...</strong>
                        &rdquo; submitted their data.
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.72em',
                          opacity: 0.6,
                        }}
                      >
                        29 September 2021, 06:54 PM
                      </Typography>
                    }
                  />
                  <ListItemAvatar>
                    <Avatar
                      alt="Notification Image"
                      src={`https://loremflickr.com/160/160/apartment,house?random=${Math.round(
                        Math.random() * 1000
                      )}`}
                      sx={{ width: 60, height: 38, bgcolor: grey[300] }}
                      variant="rounded"
                    />
                  </ListItemAvatar>
                </ListItem>
              </Fragment>
            );
          });
        }
      })()}
    </List>
  );
};

export default NotificationsList;
