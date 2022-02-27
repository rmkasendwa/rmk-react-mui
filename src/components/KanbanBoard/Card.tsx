import { Box, SxProps, Theme, alpha, useTheme } from '@mui/material';
import { FC } from 'react';

import { ICard } from './KanbanBoardContext';

export interface ICardProps extends ICard {
  isGhost?: boolean;
}

const Card: FC<ICardProps> = (props) => {
  const { title, description } = props;
  const { palette } = useTheme();

  const sx: SxProps<Theme> = {
    border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
    backgroundColor: palette.background.default,
    px: 2,
    borderRadius: 1,
    p: 1,
    cursor: 'pointer',
    minWidth: 250,
  };

  return (
    <Box>
      <Box component="article" sx={sx}>
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
    </Box>
  );
};

export default Card;
