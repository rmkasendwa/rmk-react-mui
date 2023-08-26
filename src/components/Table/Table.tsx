import '@infinite-debugger/rmk-js-extensions/Object';

import { ReactElement, Ref, forwardRef } from 'react';

import { useTable } from './hooks';
import { BaseDataRow, TableProps } from './models';

export const BaseTable = <T extends BaseDataRow>(
  inProps: TableProps<T>,
  ref: Ref<HTMLTableElement>
) => {
  return useTable(inProps, ref).tableElement;
};

export const Table = forwardRef(BaseTable) as <DataRow extends BaseDataRow>(
  p: TableProps<DataRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default Table;
