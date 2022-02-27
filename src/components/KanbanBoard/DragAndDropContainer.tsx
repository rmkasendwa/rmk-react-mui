import { Box } from '@mui/material';
import { FC, useContext } from 'react';
import { Container } from 'react-smooth-dnd';

import { KanbanBoardContext } from './KanbanBoardContext';
import Lane from './Lane';

export interface IDragAndDropContainerProps {
  showCardCount?: boolean;
}

const DragAndDropContainer: FC<IDragAndDropContainerProps> = ({
  showCardCount = false,
}) => {
  const { lanes } = useContext(KanbanBoardContext);

  return (
    <Box
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
      <Container
        orientation="horizontal"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'cards-drop-preview',
        }}
        style={{
          display: 'block',
          whiteSpace: 'nowrap',
          position: 'relative',
          height: '100%',
        }}
      >
        {lanes.map(({ id, ...rest }) => (
          <Lane key={id} {...{ id, showCardCount, ...rest }} />
        ))}
      </Container>
    </Box>
  );
};

export default DragAndDropContainer;
