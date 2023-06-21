import { Box, Typography, alpha, useTheme } from '@mui/material';
import { result } from 'lodash';
import { ReactNode, useMemo, useRef } from 'react';

import { BaseDataRow } from '../Table';
import { alignmentSyles } from './data';
import { BaseTimelineChartProps } from './models';

export interface TimelineChartDataLabelRowProps<RecordRow extends BaseDataRow>
  extends BaseTimelineChartProps<RecordRow> {
  row: RecordRow;
  expanded: boolean;
  onChangeExpanded?: (id: string) => void;
  rowLabelProperty?: keyof RecordRow;
  getRowLabel?: (row: RecordRow) => ReactNode;
}

export const TimelineChartDataLabelRow = <RecordRow extends BaseDataRow>({
  row,
  expanded,
  getTimelines,
  onChangeExpanded,
  rowLabelProperty,
  getRowLabel,
}: TimelineChartDataLabelRowProps<RecordRow>) => {
  const getTimelinesRef = useRef(getTimelines);
  getTimelinesRef.current = getTimelines;

  const { palette } = useTheme();
  const timelineCount = useMemo(() => {
    return (getTimelinesRef.current ? getTimelinesRef.current(row) : []).length;
  }, [row]);

  return (
    <Box
      className="team-assignments-timeline-data-row"
      onClick={
        timelineCount > 1
          ? () => {
              onChangeExpanded && onChangeExpanded(row.id);
            }
          : undefined
      }
      sx={{
        ...alignmentSyles,
        alignItems: 'start',
        py: 1.6,
        height: (() => {
          if (expanded) {
            return timelineCount * 50;
          }
          return 50;
        })(),
        px: 3,
        borderRight: `1px solid ${palette.divider}`,
        borderBottom: `1px solid ${palette.divider}`,
        ...(() => {
          if (timelineCount > 1) {
            if (expanded) {
              return {
                cursor: 'zoom-out',
              };
            }
            return {
              cursor: 'zoom-in',
            };
          }
          return {};
        })(),
        willChange: 'height',
        transition: 'height 300ms',
        '&.hover': {
          bgcolor: alpha(palette.primary.main, 0.1),
        },
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      <Typography variant="body2">
        {(() => {
          if (getRowLabel) {
            return getRowLabel(row);
          }
          if (rowLabelProperty) {
            return result(row, rowLabelProperty);
          }
        })()}
      </Typography>
    </Box>
  );
};

export default TimelineChartDataLabelRow;
