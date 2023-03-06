import '@infinite-debugger/rmk-js-extensions/Object';

import { BaseDataRow } from '../../interfaces/Table';
import { TableProps } from './interfaces';

export const getComputedTableProps = <DataRow extends BaseDataRow>(
  props: TableProps<DataRow>
) => {
  const fullProps: typeof props = { ...props };
  const {
    columns,
    enableCheckboxRowSelectors,
    showRowNumber,
    getEllipsisMenuToolProps,
  } = fullProps;

  const computedColumns: typeof columns = [];

  if (enableCheckboxRowSelectors) {
    computedColumns.push({
      id: 'checkbox' as any,
      width: 60,
      sortable: false,
      sx: {
        '&,>div': {
          p: 0,
        },
      },
      holdsPriorityInformation: false,
    });
  }

  if (showRowNumber) {
    computedColumns.push({
      id: 'rowNumber' as any,
      label: 'Number',
      width: 60,
      align: 'right',
      showHeaderText: false,
      opaque: true,
      sx: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
      },
      headerSx: {
        zIndex: 5,
      },
      holdsPriorityInformation: false,
    });
  }

  computedColumns.push(...columns);

  if (getEllipsisMenuToolProps) {
    computedColumns.push({
      id: 'ellipsisMenuTool' as any,
      opaque: true,
      width: 42,
      defaultColumnValue: <>&nbsp;</>,
      propagateClickToParentRowClickEvent: false,
      holdsPriorityInformation: false,
      sx: {
        position: 'sticky',
        p: 0,
        right: 0,
      },
    });
  }

  fullProps.columns = computedColumns;
  fullProps.allPropsComputed = true;

  return fullProps;
};
