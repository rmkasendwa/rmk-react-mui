import ListAltIcon from '@mui/icons-material/ListAlt';

import { SelectedSortOption } from '../../interfaces/Sort';
import { BaseDataRow } from '../../interfaces/Table';
import { GroupableField } from './models';
import SortOperationFieldSelector from './SortOperationFieldSelector';

export const expandedGroupsOptions = ['All', 'None'] as const;

export type ExpandedGroupsOption = typeof expandedGroupsOptions[number];

export interface GroupButtonProps<RecordRow extends BaseDataRow = any> {
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

const GroupButton = <RecordRow extends BaseDataRow>({
  groupableFields,
  selectedGroupParams,
  onChangeSelectedGroupParams,
}: GroupButtonProps<RecordRow>) => {
  return (
    <SortOperationFieldSelector
      sortableFields={groupableFields.map(
        ({ id, label, type, sortDirection, sortLabels }) => {
          return { id, label, type, sortDirection, sortLabels };
        }
      )}
      selectedSortParams={selectedGroupParams}
      onChangeSelectedSortParams={onChangeSelectedGroupParams}
      startIcon={<ListAltIcon />}
      sortLabel="Group"
      addFieldText="Add subgroup"
    />
  );
};

export default GroupButton;
