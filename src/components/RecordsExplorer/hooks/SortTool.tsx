import {
  ComponentsProps,
  ComponentsVariants,
  FormControlLabel,
  Switch,
  useThemeProps,
} from '@mui/material';

import { SelectedSortOption } from '../../../models/Sort';
import { BaseDataRow } from '../../Table';
import {
  SortOperationFieldSelectorToolProps,
  useSortOperationFieldSelectorTool,
} from './SortOperationFieldSelectorTool';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSortTool: SortToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiSortTool?: {
      defaultProps?: ComponentsProps['MuiSortTool'];
      variants?: ComponentsVariants['MuiSortTool'];
    };
  }
}
//#endregion

export interface SortToolProps<RecordRow extends BaseDataRow = any>
  extends Pick<
    SortOperationFieldSelectorToolProps<RecordRow>,
    'sortableFields'
  > {
  selectedSortParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

export const useSortTool = <RecordRow extends BaseDataRow>(
  inProps: SortToolProps<RecordRow>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiSortTool' });
  const { ...rest } = props;

  return useSortOperationFieldSelectorTool({
    ...rest,
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
