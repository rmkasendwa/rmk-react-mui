import { Box, Typography, alpha, useTheme } from '@mui/material';
import { FC } from 'react';

import { MONTHS, QUARTERS, alignmentSyles } from './data';

export interface TimelineChartHeaderProps {
  selectedYear: number;
}

export const TimelineChartHeader: FC<TimelineChartHeaderProps> = ({
  selectedYear,
}) => {
  const { palette } = useTheme();

  return (
    <Box
      component="header"
      className="timeline-header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        bgcolor: palette.background.paper,
      }}
    >
      <Box
        sx={{
          bgcolor: alpha(palette.primary.main, 0.1),
          display: 'flex',
          position: 'relative',
          '&>div': {
            borderRight: `1px solid ${palette.divider}`,
          },
          '&>div:last-of-type': {
            borderRightColor: 'transparent',
          },
        }}
      >
        {QUARTERS.map((quarter) => {
          return (
            <Box
              key={quarter}
              sx={{
                ...alignmentSyles,
                flex: 1,
                justifyContent: 'center',
                borderBottom: `1px solid ${palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {selectedYear} Q{quarter}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          '&>div': {
            borderRight: `1px solid ${palette.divider}`,
          },
          '&>div:last-of-type': {
            borderRightColor: 'transparent',
          },
        }}
      >
        {MONTHS.map((month) => {
          return (
            <Box
              key={month}
              sx={{
                ...alignmentSyles,
                flex: 1,
                justifyContent: 'center',
                borderBottom: `1px solid ${palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                {month}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimelineChartHeader;
