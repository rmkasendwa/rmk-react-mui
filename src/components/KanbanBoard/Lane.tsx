import {
  Badge,
  Box,
  Grid,
  Typography,
  alpha,
  darken,
  useTheme,
} from '@mui/material';
import hash from 'object-hash';
import { FC, useContext, useEffect, useState } from 'react';
import { XYCoord, useDrop } from 'react-dnd';

import Card, { ICardProps } from './Card';
import { ILane, KanbanBoardContext } from './KanbanBoardContext';

export interface ILaneProps extends ILane {}

const Lane: FC<ILaneProps> = ({ id, title, showCardCount = false, cards }) => {
  const { palette } = useTheme();
  const [ghostCardProps, setGhostCardProps] = useState<ICardProps | null>(null);
  const [clientOffset, setClientOffset] = useState<XYCoord | null>(null);
  const { setActiveLaneId } = useContext(KanbanBoardContext);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'card',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      const clientOffset = monitor.getSourceClientOffset()!;
      setClientOffset(clientOffset);
    },
  }));

  const handleDragStart = (props: ICardProps) => {
    setGhostCardProps((prevProps) => {
      if (hash(prevProps) !== hash(props)) {
        return props;
      }
      return prevProps;
    });
  };

  const handleDragEnd = () => {
    setGhostCardProps(null);
    setClientOffset(null);
  };

  useEffect(() => {
    if (isOver && canDrop && setActiveLaneId) {
      setActiveLaneId(id);
    }
  }, [canDrop, id, isOver, setActiveLaneId]);

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
        ref={drop}
        component="section"
        sx={{
          backgroundColor: darken(
            palette.background.default,
            canDrop && isOver
              ? palette.mode === 'dark'
                ? 0.4
                : 0.2
              : palette.mode === 'dark'
              ? 0.9
              : 0.1
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
            width: 360,
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
            {cards.map(({ id: cardId, ...rest }) => {
              return (
                <Card
                  key={cardId}
                  {...{ id: cardId, ...rest }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  laneId={id}
                />
              );
            })}
            {ghostCardProps && clientOffset && (
              <Box
                sx={{
                  position: 'fixed',
                  px: 1,
                  width: 360,
                  transform: `rotate(3deg)`,
                  left: clientOffset.x,
                  top: clientOffset.y,
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <Card {...ghostCardProps} isGhost />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Lane;
