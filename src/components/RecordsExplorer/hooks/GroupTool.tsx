import ListAltIcon from '@mui/icons-material/ListAlt';

import { SelectedSortOption } from '../../../models/Sort';
import { BaseDataRow } from '../../Table';
import { GroupableField } from '../models';
import { useSortOperationFieldSelectorTool } from './SortOperationFieldSelectorTool';

export const expandedGroupsOptions = ['All', 'None'] as const;

export type ExpandedGroupsOption = (typeof expandedGroupsOptions)[number];

export interface GroupToolOptions<RecordRow extends BaseDataRow = any> {
  groupableFields: GroupableField<RecordRow>[];
  getGroupableData?: (
    data: RecordRow[],
    grouping: GroupableField<RecordRow>
  ) => RecordRow[];
  selectedGroupParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedGroupParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

export const useGroupTool = <RecordRow extends BaseDataRow>({
  groupableFields,
  selectedGroupParams,
  onChangeSelectedGroupParams,
}: GroupToolOptions<RecordRow>) => {
  return useSortOperationFieldSelectorTool({
    sortableFields: groupableFields.map(
      ({ id, label, type, sortDirection, sortLabels }) => {
        return { id, label, type, sortDirection, sortLabels };
      }
    ),
    selectedSortParams: selectedGroupParams,
    onChangeSelectedSortParams: onChangeSelectedGroupParams,
    icon: <ListAltIcon />,
    sortLabel: 'Group',
    addFieldText: 'Add subgroup',
  });
};
