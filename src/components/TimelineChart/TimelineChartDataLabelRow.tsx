import { Box, Typography, alpha, useTheme } from '@mui/material';
import { ReactNode, useEffect, useMemo, useRef } from 'react';

import { BaseDataRow } from '../Table';
import { alignmentSyles } from './data';
import { BaseTimelineChartProps } from './interfaces';

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
  const getRowLabelRef = useRef(getRowLabel);

  useEffect(() => {
    getTimelinesRef.current = getTimelines;
    getRowLabelRef.current = getRowLabel;
  }, [getRowLabel, getTimelines]);

  const { palette } = useTheme();
  const timelineCount = useMemo(() => {
    return (getTimelinesRef.current ? getTimelinesRef.current(row) : []).length;
  }, [row]);

  const label = useMemo(() => {
    return rowLabelProperty
      ? row[rowLabelProperty]
      : getRowLabelRef.current
      ? getRowLabelRef.current(row)
      : null;
  }, [row, rowLabelProperty]);

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
      <Typography variant="body2">{label as any}</Typography>
    </Box>
  );
};

export default TimelineChartDataLabelRow;
