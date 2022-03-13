import { Box, BoxProps } from '@mui/material';
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
        '&>.smooth-dnd-container.horizontal>.smooth-dnd-draggable-wrapper': {
          display: 'inline-block',
        },
        '& .column-drag-handle': {
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
        {lanes.map(({ id, ...rest }) => (
          <Draggable key={id}>
            <Lane {...{ id, ...rest, showCardCount, loading, errorMessage }} />
          </Draggable>
        ))}
      </Container>
    </Box>
  );
};

export default DragAndDropContainer;
