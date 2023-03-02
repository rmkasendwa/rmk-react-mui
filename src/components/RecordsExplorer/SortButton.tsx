import { FormControlLabel, Switch } from '@mui/material';

import { SelectedSortOption } from '../../interfaces/Sort';
import { BaseDataRow } from '../../interfaces/Table';
import SortOperationFieldSelector, {
  SortOperationFieldSelectorProps,
} from './SortOperationFieldSelector';

export interface SortButtonProps<RecordRow extends BaseDataRow = any>
  extends Pick<SortOperationFieldSelectorProps<RecordRow>, 'sortableFields'> {
  selectedSortParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

const SortButton = <RecordRow extends BaseDataRow>({
  sortableFields,
  selectedSortParams,
  onChangeSelectedSortParams,
}: SortButtonProps<RecordRow>) => {
  return (
    <SortOperationFieldSelector
      {...{ sortableFields, selectedSortParams, onChangeSelectedSortParams }}
      footerContent={
        <FormControlLabel
          control={<Switch defaultChecked disabled color="success" />}
          label="Keep sorted"
          componentsProps={{
            typography: {
              sx: { fontSize: 14 },
            },
          }}
        />
      }
    />
  );
};

export default SortButton;
