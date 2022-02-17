import { Box } from '@mui/material';
import { FC } from 'react';

import Lane, { ILaneProps } from './Lane';

export interface IKanbanBoardProps {
  lanes: ILaneProps[];
  showCardCount?: boolean;
}

export const KanbanBoard: FC<IKanbanBoardProps> = ({
  lanes,
  showCardCount = false,
}) => {
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

export default KanbanBoard;
