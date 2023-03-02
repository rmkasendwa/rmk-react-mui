import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Grid, IconButton } from '@mui/material';
import { FC } from 'react';

import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';

export interface TimelineChartNavigationControlsProps {
  selectedYear: number;
}

export const TimelineChartNavigationControls: FC<
  TimelineChartNavigationControlsProps
> = ({ selectedYear }) => {
  const { setSearchParams } = useReactRouterDOMSearchParams();

  return (
    <Grid
      container
      className="timeline-navigation-controls"
      sx={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 6,
        height: 0,
      }}
    >
      <Grid item>
        <IconButton
          color="primary"
          onClick={() => {
            setSearchParams(
              {
                'timeline:year': String(selectedYear - 1),
              },
              {
                replace: true,
              }
            );
          }}
          sx={{
            p: 0.5,
            mt: 0.5,
            ml: 0.5,
          }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Grid>
      <Grid item xs />
      <Grid item>
        <IconButton
          color="primary"
          onClick={() => {
            setSearchParams(
              {
                'timeline:year': String(selectedYear + 1),
              },
              {
                replace: true,
              }
            );
          }}
          sx={{
            p: 0.5,
            mt: 0.5,
            mr: 0.5,
          }}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default TimelineChartNavigationControls;
