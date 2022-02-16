import {
  Badge,
  Box,
  Grid,
  Typography,
  alpha,
  darken,
  useTheme,
} from '@mui/material';
import { FC, ReactNode } from 'react';

import Card, { ICardProps } from './Card';

export interface ILaneProps {
  id: string | number;
  title: ReactNode;
  cards: ICardProps[];
  showCardCount?: boolean;
}

const Lane: FC<ILaneProps> = ({ title, showCardCount = false, cards }) => {
  const { palette } = useTheme();
  return (
    <Box
      sx={{
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        whiteSpace: 'normal',
      }}
    >
      <Box
        component="section"
        sx={{
          backgroundColor: darken(
            palette.background.default,
            palette.mode === 'dark' ? 0.9 : 0.1
          ),
          mr: 2,
          border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
          borderRadius: 2,
          height: '100%',
        }}
      >
        <Box component="header" sx={{ p: 1, cursor: 'grab' }}>
          <Grid container spacing={1} alignItems="center">
            {showCardCount && cards.length > 0 ? (
              <Grid item>
                <Badge
                  badgeContent={cards.length}
                  color="primary"
                  max={99}
                  sx={{
                    '&>.MuiBadge-badge': {
                      position: 'relative',
                      transform: 'none',
                    },
                  }}
                />{' '}
              </Grid>
            ) : null}
            <Grid item xs>
              <Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>
                {title}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            px: 1,
            minWidth: 300,
            minHeight: 80,
            flex: '1 1 0%',
            overflow: 'hidden auto',
            alignSelf: 'center',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: `calc(100% - 40px)`,
          }}
        >
          <Box>
            {cards.map(({ id, ...rest }) => {
              return <Card key={id} {...{ id, ...rest }} />;
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Lane;
