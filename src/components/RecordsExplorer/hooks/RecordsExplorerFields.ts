import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import { useMemo, useRef } from 'react';

import { SortableFields } from '../../../models/Sort';
import { PrimitiveDataType } from '../../../models/Utils';
import {
  BaseDataRow,
  mapTableColumnTypeToPrimitiveDataType,
} from '../../Table';
import {
  DataFilterField,
  DataView,
  ENUM_TABLE_COLUMN_TYPES,
  GroupableField,
  ListView,
  RecordsExplorerRowField,
  SearchableProperty,
} from '../models';
import { DataFilterProps } from './DataFilter';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRecordsExplorerFields: RecordsExplorerFieldsProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiRecordsExplorerFields?: {
      defaultProps?: ComponentsProps['MuiRecordsExplorerFields'];
      variants?: ComponentsVariants['MuiRecordsExplorerFields'];
    };
  }
}
//#endregion

export interface RecordsExplorerFieldsProps<
  RecordRow extends BaseDataRow = BaseDataRow
> extends Pick<DataFilterProps<RecordRow>, 'filterRevalidationKey'> {
  searchableFields?: SearchableProperty<RecordRow>[];
  filterFields?: DataFilterField<RecordRow>[];
  sortableFields?: SortableFields<RecordRow>;
  groupableFields?: GroupableField<RecordRow>[];
  fields?: RecordsExplorerRowField<RecordRow>[];
  views?: DataView<RecordRow>[];
}

export const useRecordsExplorerFields = <RecordRow extends BaseDataRow>(
  inProps: RecordsExplorerFieldsProps<RecordRow> = {}
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiRecordsExplorerFields',
  });
  const {
    filterFields: filterFieldsProp,
    sortableFields: sortableFieldsProp,
    searchableFields: searchableFieldsProp,
    groupableFields: groupableFieldsProp,
    fields,
    views,
    filterRevalidationKey,
  } = props;

  //#region Refs
  const searchableFieldsRef = useRef(searchableFieldsProp);
  searchableFieldsRef.current = searchableFieldsProp;
  const filterFieldsPropRef = useRef(filterFieldsProp);
  filterFieldsPropRef.current = filterFieldsProp;
  const sortableFieldsPropRef = useRef(sortableFieldsProp);
  sortableFieldsPropRef.current = sortableFieldsProp;
  const groupableFieldsPropRef = useRef(groupableFieldsProp);
  groupableFieldsPropRef.current = groupableFieldsProp;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const viewsPropRef = useRef(views);
  viewsPropRef.current = views;
  //#endregion

  return useMemo(() => {
    filterRevalidationKey; // Regenerate filter fields when filterRevalidationKey changes
    //#region Resolving groupable fields
    const groupableFields =
      (() => {
        const groupableFields: typeof groupableFieldsPropRef.current = [];
        if (groupableFieldsPropRef.current) {
          groupableFields.push(...groupableFieldsPropRef.current);
        }
        if (fieldsRef.current) {
          fieldsRef.current.forEach(
            ({
              id,
              label,
              type = 'string',
              groupType,
              getSortValue,
              getFilterValue,
              getGroupLabel,
              groupable,
              sortLabels,
            }) => {
              if (
                groupable &&
                !groupableFields.find(
                  ({ id: groupableFieldId }) => groupableFieldId === id
                )
              ) {
                groupableFields.push({
                  id,
                  label: String(label),
                  type:
                    groupType || mapTableColumnTypeToPrimitiveDataType(type),
                  getSortValue: getSortValue || (getFilterValue as any),
                  getGroupLabel,
                  sortLabels,
                });
              }
            }
          );
        }
        if (viewsPropRef.current) {
          const listView = viewsPropRef.current.find(
            ({ type }) => type === 'List'
          ) as ListView<RecordRow> | null;
          if (listView) {
            groupableFields.push(
              ...listView.columns
                .filter(({ id, label, type = 'string', groupable }) => {
                  return (
                    typeof label === 'string' &&
                    !groupableFields.find(
                      ({ id: groupableFieldId }) => groupableFieldId === id
                    ) &&
                    (groupable ||
                      (ENUM_TABLE_COLUMN_TYPES.includes(type) &&
                        groupable !== false))
                  );
                })
                .map(
                  ({
                    id,
                    label,
                    type = 'enum',
                    getFilterValue,
                    getColumnValue,
                    getSortValue,
                    getGroupLabel,
                    sortLabels,
                  }) => {
                    return {
                      id,
                      label: String(label),
                      type: type as PrimitiveDataType,
                      getSortValue: getSortValue || (getFilterValue as any),
                      sortLabels,
                      getGroupLabel: getGroupLabel || (getColumnValue as any),
                    };
                  }
                )
            );
            groupableFields.forEach((groupableField) => {
              const { id: groupableFieldId } = groupableField;
              if (!groupableField.getGroupLabel) {
                const column = listView.columns.find(
                  ({ id }) => id === groupableFieldId
                );
                if (column && column.getColumnValue) {
                  groupableField.getGroupLabel = column.getColumnValue as any;
                }
              }
            });
          }
        }
        if (groupableFields.length > 0) {
          return groupableFields;
        }
      })() || [];
    //#endregion

    //#region Resolving sortable fields
    const sortableFields =
      (() => {
        const sortableFields: typeof sortableFieldsPropRef.current = [];
        if (sortableFieldsPropRef.current) {
          sortableFields.push(...sortableFieldsPropRef.current);
        }
        if (fieldsRef.current) {
          fieldsRef.current.forEach(
            ({
              id,
              label,
              type = 'string',
              sortType,
              getSortValue,
              getFilterValue,
              sortable,
              sortLabels,
            }) => {
              if (
                sortable &&
                !sortableFields.find(
                  ({ id: sortableFieldId }) => sortableFieldId === id
                )
              ) {
                sortableFields.push({
                  id,
                  label: String(label),
                  type: sortType || mapTableColumnTypeToPrimitiveDataType(type),
                  getSortValue: getSortValue || (getFilterValue as any),
                  sortLabels,
                });
              }
            }
          );
        }
        if (viewsPropRef.current) {
          const listView = viewsPropRef.current.find(
            ({ type }) => type === 'List'
          ) as ListView<RecordRow> | null;
          if (listView) {
            sortableFields.push(
              ...listView.columns
                .filter(({ id, label, sortable }) => {
                  return (
                    typeof label === 'string' &&
                    sortable !== false &&
                    !sortableFields.find(
                      ({ id: sortableFieldId }) => sortableFieldId === id
                    )
                  );
                })
                .map(
                  ({
                    id,
                    label,
                    type = 'string',
                    getFilterValue,
                    getSortValue,
                    sortLabels,
                  }) => {
                    return {
                      id,
                      label: String(label),
                      type: mapTableColumnTypeToPrimitiveDataType(type),
                      getSortValue: getSortValue || (getFilterValue as any),
                      sortLabels,
                    };
                  }
                )
            );
          }
        }
        if (sortableFields.length > 0) {
          return sortableFields;
        }
      })() || [];
    //#endregion

    //#region Resolving filter fields
    const filterFields =
      (() => {
        const filterFields: typeof filterFieldsPropRef.current = [];
        if (filterFieldsPropRef.current) {
          filterFields.push(...filterFieldsPropRef.current);
        }
        if (fieldsRef.current) {
          fieldsRef.current.forEach(
            ({ id, label, type, getFilterValue, searchable }) => {
              if (
                searchable &&
                !filterFields.find(
                  ({ id: filterFieldId }) => filterFieldId === id
                )
              ) {
                filterFields.push({
                  id,
                  label: String(label),
                  type: mapTableColumnTypeToPrimitiveDataType(type) as any,
                  getFilterValue,
                });
              }
            }
          );
        }
        if (viewsPropRef.current) {
          const listView = viewsPropRef.current.find(
            ({ type }) => type === 'List'
          ) as ListView<RecordRow> | null;
          if (listView) {
            filterFields.push(
              ...listView.columns
                .filter(({ id, label, searchable }) => {
                  return (
                    typeof label === 'string' &&
                    searchable !== false &&
                    !filterFields.find(
                      ({ id: filterFieldId }) => filterFieldId === id
                    )
                  );
                })
                .map(
                  ({
                    id,
                    label,
                    type = 'string',
                    filterType,
                    getFilterValue,
                    getColumnValue,
                    getFieldOptionLabel,
                    options,
                    sortOptions,
                  }) => {
                    return {
                      id,
                      label: String(label),
                      type:
                        filterType ||
                        (mapTableColumnTypeToPrimitiveDataType(type) as any),
                      getFieldOptionLabel:
                        getFieldOptionLabel ||
                        (ENUM_TABLE_COLUMN_TYPES.includes(type) &&
                        getColumnValue
                          ? getColumnValue
                          : undefined),
                      getFilterValue,
                      options,
                      sortOptions,
                    };
                  }
                )
            );
          }
        }
        if (filterFields.length > 0) {
          return filterFields;
        }
      })() || [];
    //#endregion

    //#region Resolving searchable fields
    const searchableFields = (() => {
      const searchableFields: typeof searchableFieldsRef.current = [];
      if (searchableFieldsRef.current) {
        searchableFields.push(...searchableFieldsRef.current);
      }
      if (fieldsRef.current) {
        fieldsRef.current.forEach(
          ({ id, label, type, filterType, getFilterValue, searchable }) => {
            if (
              searchable &&
              !filterFields.find(
                ({ id: filterFieldId }) => filterFieldId === id
              )
            ) {
              filterFields.push({
                id,
                label: String(label),
                type:
                  filterType ||
                  (mapTableColumnTypeToPrimitiveDataType(type) as any),
                getFilterValue,
              });
            }
          }
        );
      }
      if (viewsPropRef.current) {
        const listView = viewsPropRef.current.find(
          ({ type }) => type === 'List'
        ) as ListView<RecordRow> | null;
        if (listView) {
          searchableFields.push(
            ...listView.columns
              .filter(({ id, label, searchable }) => {
                return (
                  typeof label === 'string' &&
                  searchable !== false &&
                  !searchableFields.find(
                    ({ id: filterFieldId }) => filterFieldId === id
                  )
                );
              })
              .map(({ id, label, getFilterValue }) => {
                return {
                  id,
                  label: label as string,
                  getFilterValue,
                };
              })
          );
        }
      }
      if (searchableFields.length > 0) {
        return searchableFields;
      }
    })();
    //#endregion

    return {
      filterFields,
      sortableFields,
      groupableFields,
      searchableFields,
    };
  }, [filterRevalidationKey]);
};
