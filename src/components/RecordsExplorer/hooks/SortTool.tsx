import { FormControlLabel, Switch } from '@mui/material';

import { SelectedSortOption } from '../../../interfaces/Sort';
import { BaseDataRow } from '../../../interfaces/Table';
import {
  SortOperationFieldSelectorToolOptions,
  useSortOperationFieldSelectorTool,
} from './SortOperationFieldSelectorTool';

export const expandedGroupsOptions = ['All', 'None'] as const;

export type ExpandedGroupsOption = typeof expandedGroupsOptions[number];

export interface SortToolOptions<RecordRow extends BaseDataRow = any>
  extends Pick<
    SortOperationFieldSelectorToolOptions<RecordRow>,
    'sortableFields'
  > {
  selectedSortParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

export const useSortTool = <RecordRow extends BaseDataRow>({
  sortableFields,
  selectedSortParams,
  onChangeSelectedSortParams,
}: SortToolOptions<RecordRow>) => {
  return useSortOperationFieldSelectorTool({
    sortableFields,
    selectedSortParams,
    onChangeSelectedSortParams,
    footerContent: (
      <FormControlLabel
        control={<Switch defaultChecked disabled color="success" />}
        label="Keep sorted"
        componentsProps={{
          typography: {
            sx: { fontSize: 14 },
          },
        }}
      />
    ),
  });
};
