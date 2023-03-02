import { ReactNode } from 'react';

import { PrimitiveDataType } from './Utils';

export const sortDirections = ['ASC', 'DESC'] as const;

export type SortDirection = typeof sortDirections[number];

export interface SortOption<T = any> {
  id: keyof T;
  label: string;
  type?: PrimitiveDataType;
  sortDirection?: SortDirection;
  sortLabels?: [ReactNode, ReactNode];
  getSortValue?: (row: T) => string | number | boolean;
}

export interface SelectedSortOption<T = any> extends SortOption<T> {
  sortDirection: SortDirection;
}

export type OnSelectSortOption<T = any> = (
  selectedSortParams: SelectedSortOption<T>[]
) => void;

export type SortableFields<T> = SortOption<T>[];

export type SortOptions<T> = Pick<
  SelectedSortOption<T>,
  'id' | 'type' | 'sortDirection' | 'getSortValue'
>[];

export type SortBy<T> = (Pick<SelectedSortOption<T>, 'id'> &
  Partial<Pick<SelectedSortOption<T>, 'sortDirection'>>)[];
