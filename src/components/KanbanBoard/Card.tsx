import { Box, alpha, useTheme } from '@mui/material';
import { FC, ReactNode } from 'react';

export interface ICardProps {
  id: string | number;
  title: ReactNode;
  description: ReactNode;
}

const Card: FC<ICardProps> = ({ title, description }) => {
  const { palette } = useTheme();
  return (
    <Box>
      <Box
        component="article"
        sx={{
          border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
          maxWidth: '360px',
          backgroundColor: palette.background.default,
          px: 2,
          mb: 1,
          borderRadius: 1,
          p: 1,
          cursor: 'pointer',
          minWidth: 250,
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
    </Box>
  );
};

export default Card;
