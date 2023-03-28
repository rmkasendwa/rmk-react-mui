import { result } from 'lodash';

import { SortOptions } from '../interfaces/Sort';
import { PrimitiveDataType } from '../interfaces/Utils';

export const sort = <RecordRow = any>(
  a: RecordRow,
  b: RecordRow,
  sortParams: SortOptions<RecordRow>
): number => {
  sortParams = [...sortParams];
  const currentSortParam = sortParams.shift()!;
  const {
    type: baseType = 'string',
    id,
    sortDirection,
    getSortValue,
  } = currentSortParam;
  const type = (() => {
    if ((['date', 'enum'] as PrimitiveDataType[]).includes(baseType)) {
      return 'string' as typeof baseType;
    }
    return baseType;
  })();
  const sortWeight = (() => {
    const aSortValue = getSortValue ? getSortValue(a) : result(a, id);
    const bSortValue = getSortValue ? getSortValue(b) : result(b, id);
    if (typeof aSortValue === type && typeof bSortValue === type) {
      switch (type) {
        case 'number':
          return (aSortValue as number) - (bSortValue as number);
        case 'boolean':
          return (aSortValue as boolean) === true ? -1 : 1;
        case 'string':
        default: {
          if (baseType === 'date') {
            return (
              new Date(aSortValue as string).getTime() -
              new Date(bSortValue as string).getTime()
            );
          }
          return (aSortValue as string)
            .toLowerCase()
            .localeCompare((bSortValue as string).toLowerCase());
        }
      }
    }
    if (typeof aSortValue === type && typeof bSortValue !== type) {
      return -1;
    }
    if (typeof aSortValue !== type && typeof bSortValue === type) {
      return 1;
    }
    return 0;
  })();

  if (sortWeight === 0 && sortParams.length !== 0) {
    return sort(a, b, sortParams);
  }
  return sortDirection === 'ASC' ? sortWeight : -sortWeight;
};
