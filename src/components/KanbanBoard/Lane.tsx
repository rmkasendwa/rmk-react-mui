import ErrorIcon from '@mui/icons-material/Error';
import {
  Badge,
  Box,
  CircularProgress,
  Grid,
  Tooltip,
  Typography,
  alpha,
  darken,
  useTheme,
} from '@mui/material';
import { FC, useContext } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';

import Card from './Card';
import { ILane, KanbanBoardContext } from './KanbanBoardContext';

export interface ILaneProps extends ILane {}

const Lane: FC<ILaneProps> = ({
  id,
  title,
  showCardCount = false,
  loading = false,
  cards,
  errorMessage,
}) => {
  const { palette } = useTheme();
  const { setActiveLaneId, moveCard } = useContext(KanbanBoardContext);

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
          '& .smooth-dnd-container': {
            minHeight: `calc(100% - 40px)`,
            px: 1,
            width: 360,
            flex: '1 1 0%',
            overflow: 'hidden auto',
            alignSelf: 'center',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: `calc(100% - 40px)`,
          },
          '& .smooth-dnd-container>.smooth-dnd-draggable-wrapper': {
            mb: 1,
          },
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
            {(() => {
              if (errorMessage) {
                return (
                  <Tooltip title={errorMessage}>
                    <ErrorIcon color="error" />
                  </Tooltip>
                );
              }
              if (loading) {
                return (
                  <Grid item>
                    <CircularProgress size={16} color="inherit" />
                  </Grid>
                );
              }
            })()}
          </Grid>
        </Box>
        <Container
          groupName="col"
          onDrop={({ addedIndex, removedIndex, payload }) => {
            moveCard && moveCard(id, { addedIndex, removedIndex, payload });
          }}
          getChildPayload={(index) => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          onDragEnter={() => {
            setActiveLaneId && setActiveLaneId(id);
          }}
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'drop-preview',
          }}
          animationDuration={200}
        >
          {cards.map(({ id: cardId, ...rest }) => {
            return (
              <Draggable key={cardId}>
                <Card {...{ id: cardId, ...rest }} laneId={id} />
              </Draggable>
            );
          })}
        </Container>
      </Box>
    </Box>
  );
};

export default Lane;
