import ListAltIcon from '@mui/icons-material/ListAlt';
import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';

import { SelectedSortOption } from '../../../models/Sort';
import { BaseDataRow } from '../../Table';
import { GroupableField } from '../models';
import { useSortOperationFieldSelectorTool } from './SortOperationFieldSelectorTool';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiGroupTool: GroupToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiGroupTool?: {
      defaultProps?: ComponentsProps['MuiGroupTool'];
      variants?: ComponentsVariants['MuiGroupTool'];
    };
  }
}
//#endregion

export const expandedGroupsOptions = ['All', 'None'] as const;

export type ExpandedGroupsOption = (typeof expandedGroupsOptions)[number];

export interface GroupToolProps<RecordRow extends BaseDataRow = any> {
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

export const useGroupTool = <RecordRow extends BaseDataRow>(
  inProps: GroupToolProps<RecordRow>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiGroupTool' });
  const {
    groupableFields,
    selectedGroupParams,
    onChangeSelectedGroupParams,
    ...rest
  } = props;

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
    ...rest,
  });
};
