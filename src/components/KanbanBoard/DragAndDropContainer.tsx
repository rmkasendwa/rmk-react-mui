import { Box } from '@mui/material';
import { FC, useContext } from 'react';
import { useDrop } from 'react-dnd';

import { KanbanBoardContext } from './KanbanBoardContext';
import Lane from './Lane';

export interface IDragAndDropContainerProps {
  showCardCount?: boolean;
}

const DragAndDropContainer: FC<IDragAndDropContainerProps> = ({
  showCardCount = false,
}) => {
  const { activeCard, movingCard, lanes, moveCard } =
    useContext(KanbanBoardContext);

  const [, drop] = useDrop({
    accept: 'card',
    drop: () => {
      moveCard && moveCard(movingCard, activeCard);
    },
  });

  return (
    <Box
      ref={drop}
      sx={{
        overflowY: 'hidden',
        p: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
    >
      <Box
        sx={{
          whiteSpace: 'nowrap',
          position: 'relative',
          height: '100%',
        }}
      >
        {lanes.map(({ id, ...rest }) => (
          <Lane key={id} {...{ id, showCardCount, ...rest }} />
        ))}
      </Box>
    </Box>
  );
};

export default DragAndDropContainer;
