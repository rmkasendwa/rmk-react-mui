import {
  Button,
  Stack,
  Typography,
  outlinedInputClasses,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode } from 'react';

import DataDropdownField, {
  dataDropdownFieldClasses,
} from '../../InputFields/DataDropdownField';
import { ElementTool } from '../../SearchSyncToolbar';
import { TimeScaleOption, timeScaleOptions } from '../models';

export interface TimeScaleToolProps {
  selectedTimeScale: TimeScaleOption;
  supportedTimeScales?: TimeScaleOption[];
  onSelectTimeScale?: (timeScale: TimeScaleOption | null) => void;
  label?: ReactNode;
}

export const useTimeScaleTool = ({
  selectedTimeScale,
  supportedTimeScales = [...timeScaleOptions],
  onSelectTimeScale,
  label = 'Timescale',
}: TimeScaleToolProps) => {
  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  return {
    element: (
      <Stack
        direction="row"
        sx={{
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {!isSmallScreenSize ? (
          <Typography variant="body2">{label}:</Typography>
        ) : null}
        <Button
          color="inherit"
          variant="contained"
          size="small"
          disableRipple
          sx={{
            minWidth: 0,
            p: 0,
          }}
        >
          <DataDropdownField
            placeholder="Timescale"
            size="small"
            value={selectedTimeScale}
            options={supportedTimeScales.map((timeScaleOption) => {
              return {
                value: timeScaleOption,
                label: timeScaleOption,
              };
            })}
            onChange={(event) => {
              onSelectTimeScale?.((event.target.value as any) || null);
            }}
            showClearButton={false}
            InputProps={{
              sx: {
                height: 32,
                pr: 0.5,
                [`.${outlinedInputClasses.notchedOutline}`]: {
                  border: 'none',
                },
              },
            }}
            WrapperProps={{
              sx: {
                [`.${dataDropdownFieldClasses.selectedOptionsWrapper}`]: {
                  top: 3,
                  width: 'calc(100% - 22px) !important',
                },
              },
            }}
            enableLoadingState={false}
            sx={{
              width: 90,
            }}
          />
        </Button>
      </Stack>
    ),
  } as ElementTool;
};
