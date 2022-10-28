import ErrorIcon from '@mui/icons-material/Error';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, darken } from '@mui/system/colorManipulator';
import { FC, useContext } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';

import Card from './Card';
import { KanbanBoardContext, Lane as LaneType } from './KanbanBoardContext';
import LaneTools from './LaneTools';

export interface LaneProps extends LaneType {}

const Lane: FC<LaneProps> = ({
  id,
  title,
  showCardCount = false,
  loading = false,
  cards,
  errorMessage,
  sx,
  footer,
  tools,
  ...rest
}) => {
  const { palette } = useTheme();
  const {
    setToLaneId,
    onCardDrop,
    setFromLaneId,
    fromLaneId,
    toLaneId,
    onCardMoveAcrossLanes,
  } = useContext(KanbanBoardContext);

  let yPaddedHeight = 40;
  footer && (yPaddedHeight += 40);

  return (
    <Box
      {...rest}
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
          bgcolor: darken(
            palette.background.default,
            palette.mode === 'dark' ? 0.9 : 0.1
          ),
          border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
          borderRadius: 2,
          height: '100%',
          '& .smooth-dnd-container': {
            minHeight: `calc(100% - ${yPaddedHeight}px)`,
            px: 1,
            width: 360,
            flex: '1 1 0%',
            overflow: 'hidden auto',
            alignSelf: 'center',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: `calc(100% - ${yPaddedHeight}px)`,
          },
          [`
            & .smooth-dnd-container>.smooth-dnd-draggable-wrapper,
            & .undraggable-wrapper
          `]: {
            mb: 1,
          },
          ...sx,
        }}
      >
        <Box component="header" className="column-drag-handle" sx={{ p: 1 }}>
          <Grid container spacing={1} alignItems="center">
            {showCardCount && cards.length > 0 ? (
              <Grid item display="flex">
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
            <Grid
              item
              xs
              sx={{ minWidth: 0, fontWeight: 'bold', fontSize: 15 }}
            >
              {(() => {
                if (typeof title === 'string') {
                  return (
                    <Tooltip title={title}>
                      <Typography
                        sx={{ fontWeight: 'bold', fontSize: 15 }}
                        noWrap
                      >
                        {title}
                      </Typography>
                    </Tooltip>
                  );
                }
                return <>{title}</>;
              })()}
            </Grid>
            {(() => {
              if (tools) {
                return (
                  <Grid item display="flex">
                    <LaneTools tools={tools} laneId={id} />
                  </Grid>
                );
              }
            })()}
            {(() => {
              if (errorMessage) {
                return (
                  <Grid item display="flex">
                    <Tooltip title={errorMessage} arrow>
                      <ErrorIcon color="error" />
                    </Tooltip>
                  </Grid>
                );
              }
              if (loading) {
                return (
                  <Grid item display="flex">
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
            onCardDrop && onCardDrop(id, { addedIndex, removedIndex, payload });
          }}
          getChildPayload={(index) => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          onDragEnd={({ isSource, payload }) => {
            if (isSource) {
              onCardMoveAcrossLanes &&
                fromLaneId != null &&
                toLaneId != null &&
                onCardMoveAcrossLanes(fromLaneId, toLaneId, payload.id);
            }
          }}
          onDragEnter={() => {
            setToLaneId && setToLaneId(id);
          }}
          onDragStart={({ isSource }) => {
            if (isSource && setFromLaneId) {
              setFromLaneId(id);
            }
          }}
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'drop-preview',
          }}
          animationDuration={200}
        >
          {cards.map(({ id: cardId, draggable = true, sx, ...rest }) => {
            const cardStyles: any = {};
            if (!draggable) {
              cardStyles.bgcolor = alpha(palette.background.paper, 0.6);
              cardStyles.userSelect = 'none';
            }
            const card = (
              <Card
                {...{ id: cardId, ...rest }}
                sx={{
                  ...cardStyles,
                  ...sx,
                }}
                laneId={id}
              />
            );
            if (!draggable) {
              return (
                <Box key={cardId} className="undraggable-wrapper">
                  {card}
                </Box>
              );
            }
            return <Draggable key={cardId}>{card}</Draggable>;
          })}
        </Container>
        {footer && (
          <Box
            component="footer"
            className="column-drag-handle"
            sx={{
              borderTop: `1px solid ${alpha(palette.text.primary, 0.2)}`,
              height: 40,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Lane;
