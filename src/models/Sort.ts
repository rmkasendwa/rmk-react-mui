import { ReactNode } from 'react';

import { PrimitiveDataType } from './Utils';

export const sortDirections = ['ASC', 'DESC'] as const;

export type SortDirection = (typeof sortDirections)[number];

export interface SortOption<RecordRow = any> {
  id: keyof RecordRow;
  label: ReactNode;
  searchableLabel?: string;
  type?: PrimitiveDataType;
  sortDirection?: SortDirection;
  sortLabels?: [ReactNode, ReactNode];
  getSortValue?: (row: RecordRow) => string | number | boolean | undefined;
  sort?: (a: RecordRow, b: RecordRow) => number;
}

export interface SelectedSortOption<RecordRow = any>
  extends SortOption<RecordRow> {
  sortDirection: SortDirection;
}

export type OnSelectSortOption<T = any> = (
  selectedSortParams: SelectedSortOption<T>[]
) => void;

export type SortableFields<T> = SortOption<T>[];

export type SortOptions<T> = Pick<
  SelectedSortOption<T>,
  'id' | 'type' | 'sortDirection' | 'getSortValue' | 'sort'
>[];

export type SortBy<T> = (Pick<SelectedSortOption<T>, 'id'> &
  Partial<Pick<SelectedSortOption<T>, 'sortDirection'>>)[];
