import { ReactElement, ReactNode } from 'react';

import { BaseDataRow } from '../../interfaces/Table';

export interface BaseTimelineChartProps<T extends BaseDataRow> {
  onSelectTimeline?: (id: string) => void;
  getTimelines?: (row: T) => BaseTimeline[];
}

export interface GetTimelineElementOptions {
  baseTimelineElement: ReactElement;
}

export interface BaseTimeline {
  id: string;
  label: ReactNode;
  startDate?: string;
  endDate?: string;
  bgcolor?: string;
  color?: string;
  getTimelineElement?: ({
    baseTimelineElement,
  }: GetTimelineElementOptions) => ReactNode;
}

export interface Timeline extends BaseTimeline {
  intersects?: boolean;
  startPercentage?: number;
  endPercentage?: number;
  displayInSelectedYear?: boolean;
}
