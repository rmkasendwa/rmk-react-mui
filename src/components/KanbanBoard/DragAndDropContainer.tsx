import { Box, BoxProps, darken, useTheme } from '@mui/material';
import { FC, useContext } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';

import { ILane, KanbanBoardContext } from './KanbanBoardContext';
import Lane from './Lane';

export interface IDragAndDropContainerProps
  extends Pick<ILane, 'showCardCount' | 'loading' | 'errorMessage'>,
    BoxProps {}

const DragAndDropContainer: FC<IDragAndDropContainerProps> = ({
  showCardCount = false,
  loading = false,
  errorMessage,
  sx,
  ...rest
}) => {
  const { lanes, onLaneDrop } = useContext(KanbanBoardContext);
  const { palette } = useTheme();

  return (
    <Box
      {...rest}
      sx={{
        overflowY: 'hidden',
        py: 1,
        px: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: '100%',
        width: '100%',
        position: 'absolute',
        ...sx,
        [`
          &>.smooth-dnd-container.horizontal>.smooth-dnd-draggable-wrapper,
          &>.smooth-dnd-container.horizontal>.undraggable-wrapper
        `]: {
          display: 'inline-block',
          height: '100%',
        },
        '& .smooth-dnd-draggable-wrapper .column-drag-handle': {
          cursor: 'grab',
        },
        '& .undraggable-wrapper .column-drag-handle': {
          userSelect: 'none',
        },
        '& .smooth-dnd-ghost': {
          transform: `rotate(3deg) scale(0.95)`,
          cursor: 'grab',
        },
      }}
    >
      <Container
        orientation="horizontal"
        dragHandleSelector=".column-drag-handle"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'cards-drop-preview',
        }}
        onDrop={({ addedIndex, removedIndex, payload }) => {
          onLaneDrop && onLaneDrop({ addedIndex, removedIndex, payload });
        }}
        style={{
          display: 'block',
          whiteSpace: 'nowrap',
          position: 'relative',
          height: '100%',
        }}
      >
        {lanes.map(({ id, draggable = true, sx, ...rest }) => {
          const laneStyles: any = {};
          if (!draggable) {
            laneStyles.bgcolor = darken(
              palette.background.default,
              palette.mode === 'dark' ? 0.7 : 0.05
            );
          }
          const lane = (
            <Lane
              {...{ id, ...rest, showCardCount, loading, errorMessage }}
              sx={{ ...laneStyles, ...sx }}
            />
          );
          if (!draggable) {
            return (
              <Box key={id} className="undraggable-wrapper">
                {lane}
              </Box>
            );
          }
          return <Draggable key={id}>{lane}</Draggable>;
        })}
      </Container>
    </Box>
  );
};

export default DragAndDropContainer;
