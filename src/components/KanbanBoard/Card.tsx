import { Box, alpha, useTheme } from '@mui/material';
import { FC, useContext } from 'react';

import { ICard, KanbanBoardContext } from './KanbanBoardContext';

export interface ICardProps extends ICard {}

const Card: FC<ICardProps> = ({
  id,
  laneId,
  title,
  description,
  sx,
  ...rest
}) => {
  const { palette } = useTheme();
  const { onCardClick } = useContext(KanbanBoardContext);

  return (
    <Box
      component="article"
      {...rest}
      sx={{
        border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
        backgroundColor: palette.background.default,
        borderRadius: 1,
        py: 1,
        px: 2,
        cursor: 'pointer',
        minWidth: 250,
        ...sx,
      }}
      onClick={() => {
        onCardClick && onCardClick(id, laneId);
      }}
    >
      <Box component="header" sx={{ pb: 1, fontSize: 14 }}>
        {title}
      </Box>
      <Box
        component="section"
        sx={{
          color: palette.text.secondary,
        }}
      >
        {description}
      </Box>
    </Box>
  );
};

export default Card;
