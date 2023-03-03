import '@infinite-debugger/rmk-js-extensions/JSON';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
  Badge,
  Box,
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  IconButton,
  Paper,
  PaperProps,
  Stack,
  Tooltip,
  Typography,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  gridClasses,
  lighten,
  tableCellClasses,
  tableContainerClasses,
  tableHeadClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { omit } from 'lodash';
import {
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import {
  SelectedSortOption,
  SortBy,
  SortDirection,
  SortableFields,
  sortDirections,
} from '../../interfaces/Sort';
import { BaseDataRow, TableColumnType } from '../../interfaces/Table';
import { PermissionCode } from '../../interfaces/Users';
import { PrimitiveDataType } from '../../interfaces/Utils';
import { sort } from '../../utils/Sort';
import {
  getTableMinWidth,
  mapTableColumnTypeToPrimitiveDataType,
} from '../../utils/Table';
import CollapsibleSection from '../CollapsibleSection';
import DataTablePagination from '../DataTablePagination';
import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from '../FixedHeaderContentArea';
import IconLoadingScreen, {
  IconLoadingScreenProps,
} from '../IconLoadingScreen';
import RenderIfVisible from '../RenderIfVisible';
import SearchSyncToolbar, { Tool } from '../SearchSyncToolbar';
import Table, { TableProps, tableClasses } from '../Table';
import TimelineChart, { TimelineChartProps } from '../TimelineChart';
import { useFilterTool } from './hooks/FilterTool';
import { useGroupTool } from './hooks/GroupTool';
import { useSortTool } from './hooks/SortTool';
import {
  ViewOptionType,
  ViewOptionsToolOptions,
  useViewOptionsTool,
  viewOptionTypes,
} from './hooks/ViewOptionsTool';
import {
  ConditionGroup,
  Conjunction,
  DataFilterField,
  DataGroup,
  FilterBySearchTerm,
  FilterOperator,
  GroupableField,
  SearchableProperty,
  filterConjunctions,
  filterOperators,
} from './models';

export interface RecordsExplorerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type RecordsExplorerClassKey = keyof RecordsExplorerClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRecordsExplorer: RecordsExplorerProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRecordsExplorer: keyof RecordsExplorerClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRecordsExplorer?: {
      defaultProps?: ComponentsProps['MuiRecordsExplorer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRecordsExplorer'];
      variants?: ComponentsVariants['MuiRecordsExplorer'];
    };
  }
}

const PRIMITIVE_DATA_TYPES: PrimitiveDataType[] = [
  'boolean',
  'date',
  'enum',
  'number',
  'string',
];

const ENUM_TABLE_COLUMN_TYPES: TableColumnType[] = ['enum'];

const modifiedStateKeyTypes = [
  'view',
  'groupBy',
  'sortBy',
  'filterBy',
  'selectedColumns',
] as const;

type ModifiedStatKey = typeof modifiedStateKeyTypes[number];

export interface BaseDataView {
  type: ViewOptionType;
  minWidth?: number;
}

export interface ListView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Omit<TableProps<RecordRow>, 'rows' | 'minWidth'> {
  type: 'List';
}

export interface TimelineView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Omit<TimelineChartProps<RecordRow>, 'rows'> {
  type: 'Timeline';
}

export type DataView<RecordRow extends BaseDataRow> =
  | ListView<RecordRow>
  | TimelineView<RecordRow>;

export interface RecordsExplorerChildrenOptions<RecordRow extends BaseDataRow> {
  viewType: ViewOptionType;
  data: RecordRow[];
  headerHeight?: number;
}

export interface RecordsExplorerFunctionChildren<State> {
  (state: State): ReactNode;
}

export interface RecordsExplorerProps<
  RecordRow extends BaseDataRow = any,
  View extends ViewOptionType = ViewOptionType
> extends Partial<Omit<PaperProps, 'title' | 'children'>>,
    Partial<Pick<FixedHeaderContentAreaProps, 'title'>> {
  rows?: RecordRow[];
  title?: ReactNode;
  children?:
    | RecordsExplorerFunctionChildren<RecordsExplorerChildrenOptions<RecordRow>>
    | ReactNode;
  load?: () => void;
  errorMessage?: string;
  loading?: boolean;
  fillContentArea?: boolean;

  /**
   * The raw data to be processed for displaying.
   */
  data: RecordRow[];
  /**
   * The label to be used when reporting display stats for multiple records.
   *
   * @example
   * "Records", "Things", "People"
   *
   * @default "Records"
   */
  recordLabelPlural?: string;
  /**
   * The label to be used when reporting display stats for a single record. If not specifies, the recordLabelPlural property will be used with any trailing 's' removed.
   *
   * @example
   * "Record", "Thing", "Person"
   */
  recordLabelSingular?: string;
  /**
   * Extra props to be assigned to the ViewOptionsButton component.
   */
  ViewOptionsButtonProps?: Partial<ViewOptionsToolOptions>;
  /**
   * Extra props to be assigned to the Header component.
   */
  HeaderProps?: Partial<PaperProps>;
  /**
   * Extra props to be assigned to the Body component.
   */
  BodyProps?: Partial<BoxProps>;
  /**
   * List of predefined data views to render input data.
   */
  views?: DataView<RecordRow>[];
  view?: View;
  /**
   * Page path to create a new data record.
   */
  pathToAddNew?: string;
  /**
   * Permission the user should have in order to create a new data record.
   */
  permissionToAddNew?: PermissionCode;
  /**
   * Permission the user should have to be able to click and open data records.
   */
  permissionToViewDetails?: PermissionCode;
  /**
   * Loading experiences customization props.
   */
  IconLoadingScreenProps?: Partial<IconLoadingScreenProps>;
  /**
   * Determines if the add new button should be displayed when the input data list has no records
   *
   * @default false
   */
  hideAddNewButtonOnNoFilteredData?: boolean;
  id?: string;
  /**
   * Function to be called when user searches.
   */
  filterBySearchTerm?: FilterBySearchTerm<RecordRow>;
  /**
   * The searchable properties on the input data set records.
   */
  searchableFields?: SearchableProperty<RecordRow>[];
  filterFields?: DataFilterField<RecordRow>[];
  filterBy?: Omit<ConditionGroup<RecordRow>, 'conjunction'> &
    Partial<Pick<ConditionGroup<RecordRow>, 'conjunction'>>;
  sortableFields?: SortableFields<RecordRow>;
  sortBy?: SortBy<RecordRow>;
  groupableFields?: GroupableField<RecordRow>[];
  groupBy?: SortBy<RecordRow>;
  getGroupableData?: (
    data: RecordRow[],
    grouping: GroupableField<RecordRow>
  ) => RecordRow[];
}

export function getRecordsExplorerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiRecordsExplorer', slot);
}

export const recordsExplorerClasses: RecordsExplorerClasses =
  generateUtilityClasses('MuiRecordsExplorer', ['root']);

const slots = {
  root: ['root'],
};

export const BaseRecordsExplorer = <
  RecordRow extends BaseDataRow,
  View extends ViewOptionType = ViewOptionType
>(
  inProps: RecordsExplorerProps<RecordRow, View>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiRecordsExplorer' });
  const {
    className,
    title,
    sx,
    fillContentArea = true,
    load,
    loading,
    errorMessage,
    recordLabelPlural = 'Records',
    HeaderProps = {},
    BodyProps = {},
    IconLoadingScreenProps = {},
    data,
    ViewOptionsButtonProps,
    filterFields: filterFieldsProp,
    sortableFields: sortableFieldsProp,
    sortBy: sortByProp,
    groupableFields: groupableFieldsProp,
    groupBy: groupByProp,
    filterBy: filterByProp,
    views,
    view: viewProp,
    pathToAddNew,
    permissionToAddNew,
    hideAddNewButtonOnNoFilteredData = false,
    children,
    filterBySearchTerm,
    searchableFields: searchableFieldsProp,
    getGroupableData,
    ...rest
  } = omit(props, 'recordLabelSingular');

  let { recordLabelSingular } = props;

  const classes = composeClasses(
    slots,
    getRecordsExplorerUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  recordLabelSingular ||
    (recordLabelSingular = recordLabelPlural.replace(/s$/gi, ''));
  const lowercaseRecordLabelPlural = recordLabelPlural.toLowerCase();
  const lowercaseRecordLabelSingular = recordLabelSingular.toLowerCase();

  const { sx: HeaderPropsSx, ...HeaderPropsRest } = HeaderProps;
  const { sx: BodyPropsSx, ...BodyPropsRest } = BodyProps;

  // Refs
  const isInitialMountRef = useRef(true);
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const filterBySearchTermRef = useRef(filterBySearchTerm);
  const searchableFieldsRef = useRef(searchableFieldsProp);
  const filterFieldsRef = useRef(filterFieldsProp);
  const sortableFieldsRef = useRef(sortableFieldsProp);
  const groupableFieldsRef = useRef(groupableFieldsProp);
  const getGroupableDataRef = useRef(getGroupableData);
  const viewsRef = useRef(views);
  useEffect(() => {
    filterBySearchTermRef.current = filterBySearchTerm;
    searchableFieldsRef.current = searchableFieldsProp;
    groupableFieldsRef.current = groupableFieldsProp;
    sortableFieldsRef.current = sortableFieldsProp;
    filterFieldsRef.current = filterFieldsProp;
    getGroupableDataRef.current = getGroupableData;
    viewsRef.current = views;
  }, [
    filterBySearchTerm,
    filterFieldsProp,
    getGroupableData,
    groupableFieldsProp,
    searchableFieldsProp,
    sortableFieldsProp,
    views,
  ]);

  const { palette, spacing } = useTheme();

  // Resolving data operation fields
  const {
    filterFields = [],
    sortableFields = [],
    groupableFields = [],
    searchableFields,
  } = useMemo(() => {
    // Resolving groupable fields
    const groupableFields = (() => {
      const groupableFields: typeof groupableFieldsRef.current = [];
      if (groupableFieldsRef.current) {
        groupableFields.push(...groupableFieldsRef.current);
      }
      if (viewsRef.current) {
        const listView = viewsRef.current.find(
          ({ type }) => type === 'List'
        ) as ListView<RecordRow> | null;
        if (listView) {
          groupableFields.push(
            ...listView.columns
              .filter(({ id, label, type = 'string' }) => {
                return (
                  typeof label === 'string' &&
                  !groupableFields.find(
                    ({ id: groupableFieldId }) => groupableFieldId === id
                  ) &&
                  ENUM_TABLE_COLUMN_TYPES.includes(type)
                );
              })
              .map(({ id, label, type = 'enum' }) => {
                return {
                  id,
                  label: String(label),
                  type: type as PrimitiveDataType,
                };
              })
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
    })();

    // Resolving sortable fields
    const sortableFields = (() => {
      const sortableFields: typeof sortableFieldsRef.current = [];
      if (sortableFieldsRef.current) {
        sortableFields.push(...sortableFieldsRef.current);
      }
      if (viewsRef.current) {
        const listView = viewsRef.current.find(
          ({ type }) => type === 'List'
        ) as ListView<RecordRow> | null;
        if (listView) {
          sortableFields.push(
            ...listView.columns
              .filter(({ id, label }) => {
                return (
                  typeof label === 'string' &&
                  !sortableFields.find(
                    ({ id: sortableFieldId }) => sortableFieldId === id
                  )
                );
              })
              .map(({ id, label, type = 'string' }) => {
                return {
                  id,
                  label: String(label),
                  type: mapTableColumnTypeToPrimitiveDataType(type),
                };
              })
          );
        }
      }
      if (sortableFields.length > 0) {
        return sortableFields;
      }
    })();

    // Resolving filter fields
    const filterFields = (() => {
      const filterFields: typeof filterFieldsRef.current = [];
      if (filterFieldsRef.current) {
        filterFields.push(...filterFieldsRef.current);
      }
      if (viewsRef.current) {
        const listView = viewsRef.current.find(
          ({ type }) => type === 'List'
        ) as ListView<RecordRow> | null;
        if (listView) {
          filterFields.push(
            ...listView.columns
              .filter(({ id, label }) => {
                return (
                  typeof label === 'string' &&
                  !filterFields.find(
                    ({ id: filterFieldId }) => filterFieldId === id
                  )
                );
              })
              .map(({ id, label, type = 'string', getColumnValue }) => {
                return {
                  id,
                  label: String(label),
                  type: mapTableColumnTypeToPrimitiveDataType(type) as any,
                  getFieldOptionLabel:
                    ENUM_TABLE_COLUMN_TYPES.includes(type) && getColumnValue
                      ? getColumnValue
                      : undefined,
                  getFilterValue: getColumnValue as any,
                };
              })
          );
        }
      }
      if (filterFields.length > 0) {
        return filterFields;
      }
    })();

    // Resolving filter fields
    const searchableFields = (() => {
      const searchableFields: typeof searchableFieldsRef.current = [];
      if (searchableFieldsRef.current) {
        searchableFields.push(...searchableFieldsRef.current);
      }
      if (viewsRef.current) {
        const listView = viewsRef.current.find(
          ({ type }) => type === 'List'
        ) as ListView<RecordRow> | null;
        if (listView) {
          searchableFields.push(
            ...listView.columns
              .filter(({ id, label, type = 'string' }) => {
                return (
                  typeof label === 'string' &&
                  !searchableFields.find(
                    ({ id: filterFieldId }) => filterFieldId === id
                  ) &&
                  PRIMITIVE_DATA_TYPES.includes(type as PrimitiveDataType)
                );
              })
              .map(({ id, label }) => {
                return {
                  id,
                  label: String(label),
                };
              })
          );
        }
      }
      if (searchableFields.length > 0) {
        return searchableFields;
      }
    })();

    return {
      filterFields,
      sortableFields,
      groupableFields,
      searchableFields,
    };
  }, []);

  // Filter fields state
  const baseConditionGroup = useMemo(() => {
    return {
      conjunction: 'and',
      conditions: [],
    } as ConditionGroup<RecordRow>;
  }, []);

  const baseSelectedColumnIds = useMemo(() => {
    if (viewsRef.current) {
      const listView = viewsRef.current.find(
        ({ type }) => type === 'List'
      ) as ListView<RecordRow> | null;
      if (listView) {
        if (listView.selectedColumnIds) {
          return listView.selectedColumnIds;
        }
        return listView.columns.map(({ id }) => String(id) as any);
      }
    }
  }, []);

  const {
    searchParams: {
      view: searchParamView,
      groupBy: searchParamGroupBy = [],
      sortBy: searchParamSortBy = [],
      search: searchTerm,
      filterBy: searchParamFilterBy,
      selectedColumns: searchParamSelectedColumns,
      expandedGroups: searchParamExpandedGroups,
      modifiedKeys: modifiedStateKeys = [],
    },
    setSearchParams,
  } = useReactRouterDOMSearchParams({
    mode: 'json',
    validator: Yup.object({
      view: Yup.mixed<ViewOptionType>().oneOf([...viewOptionTypes]),
      groupBy: Yup.array().of(
        Yup.object({
          id: Yup.mixed<keyof RecordRow>().required(),
          sortDirection: Yup.mixed<SortDirection>()
            .required()
            .oneOf([...sortDirections]),
        })
      ),
      expandedGroups: Yup.mixed<'All' | 'None' | string[]>(),
      sortBy: Yup.array().of(
        Yup.object({
          id: Yup.mixed<keyof RecordRow>().required(),
          sortDirection: Yup.mixed<SortDirection>()
            .required()
            .oneOf([...sortDirections]),
        })
      ),
      filterBy: Yup.object({
        conjunction: Yup.mixed<Conjunction>().oneOf([...filterConjunctions]),
        conditions: Yup.array()
          .of(
            Yup.object({
              fieldId: Yup.mixed<keyof RecordRow>().required(),
              operator: Yup.mixed<FilterOperator>()
                .oneOf([...filterOperators])
                .required(),
              value: Yup.mixed<string | number | (string | number)[]>(),
            })
          )
          .required(),
      }),
      search: Yup.string(),
      selectedColumns: Yup.array().of(Yup.string().required()),
      modifiedKeys: Yup.array().of(
        Yup.mixed<ModifiedStatKey>()
          .oneOf([...modifiedStateKeyTypes])
          .required()
      ),
    }),
  });

  const viewType = (() => {
    if (searchParamView) {
      return searchParamView as View;
    }
    if (viewProp && !modifiedStateKeys.includes('view')) {
      return viewProp;
    }
    return 'List' as View;
  })();

  const selectedGroupParams = (() => {
    const groupByParams = groupableFields.reduce(
      (accumulator, groupByParam) => {
        accumulator[groupByParam.id] = groupByParam;
        return accumulator;
      },
      {} as Record<keyof RecordRow, typeof groupableFields[number]>
    );

    return (
      groupByProp &&
      !modifiedStateKeys.includes('groupBy') &&
      searchParamGroupBy.length <= 0
        ? groupByProp
        : searchParamGroupBy
    )
      .filter(({ id }) => {
        return groupByParams[id];
      })
      .map((groupByParam) => {
        return {
          ...groupByParam,
          ...groupByParams[groupByParam.id],
        };
      })
      .map((groupByParam) => {
        return {
          ...groupByParam,
          sortDirection: groupByParam.sortDirection || 'ASC',
        };
      });
  })();

  const selectedSortParams = (() => {
    const sortByParams = sortableFields.reduce((accumulator, sortByParam) => {
      accumulator[sortByParam.id] = sortByParam;
      return accumulator;
    }, {} as Record<keyof RecordRow, typeof sortableFields[number]>);

    return (
      sortByProp &&
      !modifiedStateKeys.includes('sortBy') &&
      searchParamSortBy.length <= 0
        ? sortByProp
        : searchParamSortBy
    )
      .filter(({ id }) => {
        return sortByParams[id];
      })
      .map((sortByParam) => {
        return {
          ...sortByParam,
          ...sortByParams[sortByParam.id],
        };
      })
      .map((sortByParams) => {
        return {
          ...sortByParams,
          sortDirection: sortByParams.sortDirection || 'ASC',
        };
      });
  })();

  const selectedConditionGroup = (() => {
    if (searchParamFilterBy) {
      return {
        ...searchParamFilterBy,
        conjunction: searchParamFilterBy.conjunction || 'and',
      };
    }
    if (filterByProp && !modifiedStateKeys.includes('filterBy')) {
      return {
        ...filterByProp,
        conjunction: filterByProp.conjunction || 'and',
      };
    }
    return baseConditionGroup;
  })();

  const selectedColumnIds =
    searchParamSelectedColumns || baseSelectedColumnIds || [];

  const { loggedInUserHasPermission } = useAuth();

  // Processing data
  const filteredData = (() => {
    // Filtering data
    const dataFilteredByFilterFields = (() => {
      if (filterFields) {
        if (selectedConditionGroup.conditions.length > 0) {
          const emptyfilterOperators: FilterOperator[] = [
            'is empty',
            'is not empty',
          ];
          return data.filter((row) => {
            return selectedConditionGroup.conditions
              .filter(({ operator, value }) => {
                return (
                  emptyfilterOperators.includes(operator) ||
                  (value != null && String(value).length > 0)
                );
              })
              [selectedConditionGroup.conjunction === 'and' ? 'every' : 'some'](
                ({ operator, value, fieldId }) => {
                  const { rawFieldValue, formattedFieldValue }: any = (() => {
                    const rawFieldValue = (row as any)[fieldId];
                    const filterField = filterFields!.find(
                      ({ id }) => id === fieldId
                    );
                    if (filterField && filterField.getFilterValue) {
                      return {
                        rawFieldValue,
                        formattedFieldValue: filterField.getFilterValue(row),
                      };
                    }
                    return {
                      rawFieldValue,
                      formattedFieldValue: rawFieldValue,
                    };
                  })();
                  return [rawFieldValue, formattedFieldValue].some(
                    (fieldValue) => {
                      switch (operator) {
                        case 'is':
                          return Array.isArray(fieldValue)
                            ? fieldValue.some(
                                (fieldValueItem) =>
                                  fieldValueItem === (value as any)
                              )
                            : fieldValue === (value as any);
                        case 'is not':
                          return Array.isArray(fieldValue)
                            ? fieldValue.some(
                                (fieldValueItem) =>
                                  fieldValueItem !== (value as any)
                              )
                            : fieldValue !== (value as any);
                        case 'is any of':
                          return (
                            Array.isArray(value) &&
                            ((Array.isArray(fieldValue) &&
                              fieldValue.some((filterValue) =>
                                value.includes(filterValue as any)
                              )) ||
                              value.includes(fieldValue as any))
                          );
                        case 'is none of':
                          return (
                            Array.isArray(value) &&
                            ((Array.isArray(fieldValue) &&
                              fieldValue.some(
                                (fieldValueItem) =>
                                  !value.includes(fieldValueItem as any)
                              )) ||
                              !value.includes(fieldValue as any))
                          );
                        case 'is empty':
                          return (
                            (Array.isArray(fieldValue) &&
                              fieldValue.length <= 0) ||
                            !fieldValue
                          );
                        case 'is not empty':
                          return (
                            (Array.isArray(fieldValue) &&
                              fieldValue.length > 0) ||
                            fieldValue
                          );
                        case 'contains':
                          return String(fieldValue)
                            .toLowerCase()
                            .match(String(value).toLowerCase());
                        case 'does not contain':
                          return !String(fieldValue)
                            .toLowerCase()
                            .match(String(value).toLowerCase());
                        case '=':
                          return fieldValue === value;
                        case '≠':
                          return fieldValue !== value;
                        case '<':
                          return value && fieldValue < value;
                        case '>':
                          return value && fieldValue > value;
                        case '≤':
                          return value && fieldValue <= value;
                        case '≥':
                          return value && fieldValue >= value;
                        default:
                          return false;
                      }
                    }
                  );
                }
              );
          });
        }
      }
      return data;
    })();
    const filteredData = (() => {
      if (searchTerm && searchTerm.length > 0) {
        if (filterBySearchTermRef.current) {
          return dataFilteredByFilterFields.filter((row) =>
            filterBySearchTermRef.current!(searchTerm, row)
          );
        }
        if (searchableFields) {
          const searchableFieldIds = searchableFields.map(({ id }) => id);
          const lowercaseSearchTerm = searchTerm.toLowerCase();
          return dataFilteredByFilterFields.filter((row) => {
            return searchableFieldIds.some((id) => {
              const value = row[id];
              if (typeof value === 'string') {
                return value.toLowerCase().match(lowercaseSearchTerm);
              }
              return false;
            });
          });
        }
      }
      return dataFilteredByFilterFields;
    })();

    // Sorting data
    const sortedData = (() => {
      if (selectedSortParams && selectedSortParams.length > 0) {
        return [...filteredData].sort((a, b) => {
          return sort(a, b, selectedSortParams);
        });
      }
      return filteredData;
    })();

    return sortedData;
  })();

  // Grouping data
  const groupedData = (() => {
    if (selectedGroupParams.length > 0) {
      const groupParams = [...selectedGroupParams];
      const currentGroupParams = groupParams.shift()!;
      const { id, getGroupLabel } = currentGroupParams;
      const groupableData = getGroupableDataRef.current
        ? getGroupableDataRef.current(filteredData, currentGroupParams)
        : filteredData;
      return groupableData
        .reduce((accumulator, row: any) => {
          let existingGroup = accumulator.find(({ groupName }) => {
            return (
              (row[id] == null && groupName === '') ||
              (row[id] != null && groupName === String(row[id]))
            );
          })!;
          if (!existingGroup) {
            existingGroup = {
              ...row,
              groupName: row[id] != null ? String(row[id]) : '',
            };
            accumulator.push(existingGroup);
          }
          existingGroup.children ?? (existingGroup.children = []);
          existingGroup.children.push(row);
          return accumulator;
        }, [] as DataGroup<RecordRow>[])
        .map((group) => {
          return {
            ...group,
            label: getGroupLabel ? getGroupLabel(group) : group.groupName,
          };
        })
        .sort((a, b) => {
          return sort(a, b, [currentGroupParams as any]);
        });
    }
    return null;
  })();

  const viewOptionsTool = useViewOptionsTool({
    viewOptionTypes: (() => {
      if (views) {
        return views.map(({ type }) => type);
      }
    })(),
    ...ViewOptionsButtonProps,
    viewType,
    onChangeViewType: (view) => {
      setSearchParams(
        {
          view,
          modifiedKeys: [
            ...new Set([...modifiedStateKeys, 'view']),
          ] as typeof modifiedStateKeys,
        },
        {
          replace: true,
        }
      );
    },
  });

  const groupTool = useGroupTool({
    groupableFields,
    getGroupableData,
    selectedGroupParams,
    onChangeSelectedGroupParams: (groupParams) => {
      setSearchParams(
        {
          groupBy: groupParams.map(({ id, sortDirection }) => {
            return {
              id,
              sortDirection,
            };
          }),
          modifiedKeys: [
            ...new Set([...modifiedStateKeys, 'groupBy']),
          ] as typeof modifiedStateKeys,
        },
        {
          replace: true,
        }
      );
    },
  });

  const sortTool = useSortTool({
    sortableFields,
    selectedSortParams,
    onChangeSelectedSortParams: (sortParams) => {
      setSearchParams(
        {
          sortBy: sortParams.map(({ id, sortDirection }) => {
            return {
              id,
              sortDirection,
            };
          }),
          modifiedKeys: [
            ...new Set([...modifiedStateKeys, 'sortBy']),
          ] as typeof modifiedStateKeys,
        },
        {
          replace: true,
        }
      );
    },
  });

  const filterTool = useFilterTool({
    data,
    filterFields,
    selectedConditionGroup,
    onChangeSelectedConditionGroup: (conditionGroup) => {
      setSearchParams(
        {
          filterBy: conditionGroup as any,
          modifiedKeys: [
            ...new Set([...modifiedStateKeys, 'filterBy']),
          ] as typeof modifiedStateKeys,
        },
        { replace: true }
      );
    },
  });

  // Initial mount ref
  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const resetToDefaultView = () => {
    setSearchParams(
      {
        view: null,
        sortBy: null,
        groupBy: null,
        search: null,
        selectedColumns: null,
        expandedGroups: null,
        filterBy: null,
        modifiedKeys: null,
      },
      {
        replace: true,
      }
    );
  };

  const allGroupsExpanded = Boolean(
    !searchParamExpandedGroups || searchParamExpandedGroups === 'All'
  );
  const expandedGroups = (() => {
    if (Array.isArray(searchParamExpandedGroups)) {
      return searchParamExpandedGroups;
    }
    return [];
  })();

  const viewElement = (() => {
    if (views) {
      const selectedView = views.find(({ type }) => type === viewType);
      if (selectedView) {
        const { type } = selectedView;
        switch (type) {
          case 'List':
            const { minColumnWidth, enableColumnDisplayToggle = true } =
              selectedView;
            const displayingColumns = selectedView.columns.filter(({ id }) => {
              return selectedColumnIds.includes(String(id) as any);
            });
            const {
              minWidth = getTableMinWidth(
                displayingColumns.map((column) => {
                  const { minWidth } = column;
                  return {
                    ...column,
                    minWidth: minWidth ?? minColumnWidth,
                  };
                }),
                {
                  enableColumnDisplayToggle,
                }
              ),
            } = selectedView;
            return (
              <Box
                sx={{
                  position: 'relative',
                  [`.${tableClasses.columnDisplayToggle}`]: {
                    minWidth,
                  },
                }}
              >
                {(() => {
                  const { ...viewProps } = omit(
                    selectedView,
                    'type',
                    'minWidth'
                  ) as ListView<RecordRow>;

                  const baseTableProps: typeof viewProps = {
                    ...viewProps,
                    paging: false,
                    enableColumnDisplayToggle,
                    bordersVariant: 'square',
                    selectedColumnIds,
                  };

                  const tableControlProps: Partial<typeof viewProps> = {
                    sortable: true,
                    handleSortOperations: false,
                    sortBy: selectedSortParams,
                    onChangeSortBy: (sortOptions) => {
                      if (
                        sortOptions
                          .map(
                            ({ id, sortDirection }) =>
                              String(id) + sortDirection
                          )
                          .join(',') !==
                        selectedSortParams
                          .map(
                            ({ id, sortDirection }) =>
                              String(id) + sortDirection
                          )
                          .join(',')
                      ) {
                        setSearchParams(
                          {
                            sortBy: sortOptions
                              .map((sortBy) => {
                                const { id } = sortBy;
                                return [
                                  sortableFields.find(
                                    ({ id: currentId }) => currentId === id
                                  )!,
                                  sortBy,
                                ];
                              })
                              .filter(
                                ([selectedSortParam]) =>
                                  selectedSortParam != null
                              )
                              .map(([selectedSortParam, { sortDirection }]) => {
                                return {
                                  ...selectedSortParam,
                                  sortDirection: sortDirection || 'ASC',
                                } as SelectedSortOption<RecordRow>;
                              }),
                            modifiedKeys: [
                              ...new Set([...modifiedStateKeys, 'sortBy']),
                            ] as typeof modifiedStateKeys,
                          },
                          {
                            replace: true,
                          }
                        );
                      }
                    },
                    onChangeSelectedColumnIds: (localSelectedColumnIds) => {
                      if (selectedColumnIds !== localSelectedColumnIds) {
                        setSearchParams(
                          {
                            selectedColumns: localSelectedColumnIds.map(
                              (selectedColumnId) => {
                                return String(selectedColumnId);
                              }
                            ),
                            modifiedKeys: [
                              ...new Set([
                                ...modifiedStateKeys,
                                'selectedColumns',
                              ]),
                            ] as typeof modifiedStateKeys,
                          },
                          {
                            replace: true,
                          }
                        );
                      }
                    },
                  };

                  const { columns, sx } = baseTableProps;
                  const baseTableColumns = columns.map((column) => ({
                    ...column,
                  }));

                  baseTableColumns[0] = {
                    ...baseTableColumns[0],
                    sx: {
                      ...baseTableColumns[0].sx,
                      position: 'sticky',
                      left: 0,
                    },
                    headerSx: {
                      ...baseTableColumns[0].headerSx,
                      zIndex: 5,
                      ...(() => {
                        if (groupedData) {
                          return {
                            '&>div': {
                              pl: 2,
                            },
                          };
                        }
                      })(),
                    },
                    bodySx: {
                      ...baseTableColumns[0].bodySx,
                      zIndex: 1,
                    },
                    opaque: true,
                  };
                  displayingColumns[0] = {
                    ...displayingColumns[0],
                    sx: {
                      ...displayingColumns[0].sx,
                      position: 'sticky',
                      left: 0,
                    },
                    bodySx: {
                      ...displayingColumns[0].bodySx,
                      zIndex: 1,
                    },
                    opaque: true,
                  };

                  if (groupedData) {
                    const headerColumns = baseTableColumns.map((column) => ({
                      ...column,
                    }));
                    headerColumns[0] = {
                      ...headerColumns[0],
                      label: (
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Box
                            onClick={() => {
                              setSearchParams(
                                {
                                  expandedGroups: allGroupsExpanded
                                    ? 'None'
                                    : 'All',
                                },
                                {
                                  replace: true,
                                }
                              );
                            }}
                            sx={{
                              display: 'flex',
                              cursor: 'pointer',
                            }}
                          >
                            {allGroupsExpanded ? (
                              <KeyboardArrowDownIcon />
                            ) : (
                              <KeyboardArrowRightIcon />
                            )}
                          </Box>
                          {headerColumns[0].label}
                        </Stack>
                      ),
                      searchableLabel: String(headerColumns[0].label),
                    };

                    return (
                      <>
                        <Table
                          {...baseTableProps}
                          {...tableControlProps}
                          className={clsx(
                            `Mui-group-header-table`,
                            baseTableProps.className
                          )}
                          columns={headerColumns}
                          showDataRows={false}
                          stickyHeader
                          sx={{
                            position: 'sticky',
                            top: 0,
                            bgcolor: palette.background.paper,
                            zIndex: 5,
                            minWidth,
                            ...sx,
                          }}
                        />
                        {(() => {
                          return groupedData.map(
                            ({ groupName, label, children }, index) => {
                              const id = groupName || '(Empty)';
                              const collapsed =
                                !expandedGroups.includes(id) &&
                                !allGroupsExpanded;
                              return (
                                <RenderIfVisible
                                  key={groupName || index}
                                  displayPlaceholder={false}
                                  unWrapChildrenIfVisible
                                  stayRendered
                                  sx={{
                                    height: 70,
                                  }}
                                >
                                  <CollapsibleSection
                                    title={
                                      <Typography
                                        component="div"
                                        variant="body2"
                                        sx={{
                                          ...(() => {
                                            if (!groupName) {
                                              return {
                                                opacity: 0.3,
                                              };
                                            }
                                          })(),
                                        }}
                                      >
                                        <Grid container gap={1}>
                                          <Grid item>{label || '(Empty)'}</Grid>
                                          {children ? (
                                            <Grid item>
                                              <Badge
                                                color="default"
                                                badgeContent={children.length}
                                                max={999}
                                                sx={{
                                                  '&>.MuiBadge-badge': {
                                                    position: 'relative',
                                                    transform: 'none',
                                                    bgcolor: (palette.mode ===
                                                      'dark'
                                                      ? lighten
                                                      : darken)(
                                                      palette.background.paper,
                                                      0.1
                                                    ),
                                                  },
                                                }}
                                              />
                                            </Grid>
                                          ) : null}
                                        </Grid>
                                      </Typography>
                                    }
                                    color="inherit"
                                    HeaderWrapperProps={{
                                      position: 'sticky',
                                      top: 48,
                                      bgcolor: palette.background.paper,
                                      zIndex: 2,
                                    }}
                                    HeaderProps={{
                                      sx: {
                                        py: 1.5,
                                        pl: 2,
                                        pr: 3,
                                        position: 'sticky',
                                        left: 0,
                                        width: 'auto',
                                        display: 'inline-flex',
                                      },
                                    }}
                                    BodyProps={{
                                      sx: {
                                        py: 0,
                                        '& tr>td:first-of-type': {
                                          pl: 6,
                                        },
                                      },
                                    }}
                                    collapseIndicatorVariant="leading"
                                    collapsed={collapsed}
                                    onChangeCollapsed={(collapsed: boolean) => {
                                      const groups = allGroupsExpanded
                                        ? groupedData.map(({ groupName }) => {
                                            return groupName || '(Empty)';
                                          })
                                        : [...expandedGroups];
                                      if (collapsed) {
                                        groups.includes(id) &&
                                          groups.splice(groups.indexOf(id), 1);
                                      } else {
                                        groups.includes(id) || groups.push(id);
                                      }
                                      setSearchParams(
                                        {
                                          expandedGroups: (() => {
                                            if (groups.length > 0) {
                                              if (
                                                groupedData.length ===
                                                groups.length
                                              ) {
                                                return 'All';
                                              }
                                              groups.includes('None') &&
                                                groups.splice(
                                                  groups.indexOf('None'),
                                                  1
                                                );
                                              return groups;
                                            } else {
                                              return 'None';
                                            }
                                          })(),
                                        },
                                        {
                                          replace: true,
                                        }
                                      );
                                    }}
                                    sx={{
                                      minWidth,
                                    }}
                                  >
                                    <Table
                                      {...baseTableProps}
                                      columns={displayingColumns}
                                      showHeaderRow={false}
                                      stickyHeader
                                      rows={children || []}
                                      {...{ sx }}
                                    />
                                  </CollapsibleSection>
                                </RenderIfVisible>
                              );
                            }
                          );
                        })()}
                      </>
                    );
                  }
                  return (
                    <Table
                      {...baseTableProps}
                      {...tableControlProps}
                      columns={baseTableColumns}
                      rows={filteredData}
                      stickyHeader
                      sx={{
                        minWidth,
                        [`
                          & .${tableContainerClasses.root}
                        `]: {
                          overflow: 'visible',
                        },
                        [`
                          & .${tableHeadClasses.root}
                        `]: {
                          bgcolor: palette.background.paper,
                          zIndex: 5,
                          '& th': {
                            borderBottom: `1px solid ${palette.divider}`,
                          },
                        },
                        ...sx,
                      }}
                    />
                  );
                })()}
              </Box>
            );
          case 'Timeline': {
            const { ...viewProps } = omit(
              selectedView,
              'type'
            ) as TimelineView<RecordRow>;
            return <TimelineChart rows={filteredData} {...viewProps} />;
          }
        }
      }
    }
  })() as ReactNode | undefined;

  const explorerElement = (
    <Paper
      ref={ref}
      className={clsx(classes.root)}
      {...rest}
      sx={{
        ...sx,
        '&:hover>.show-more-button-container': {
          opacity: 1,
        },
        position: 'sticky',
        ...(() => {
          if (fillContentArea) {
            return {
              overflow: 'hidden',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            };
          }
          return {
            [`
          table.${tableClasses.root}.Mui-group-header-table,
          thead.${tableHeadClasses.root},
          th.${tableCellClasses.root}
        `]: {
              // top: 48,
            },
            [`.MuiCollapsibleSection-header`]: {
              // top: 96,
            },
          };
        })(),
      }}
    >
      <Paper
        elevation={0}
        {...HeaderPropsRest}
        ref={headerElementRef}
        component="header"
        sx={{ position: 'sticky', top: 0, zIndex: 10, ...HeaderPropsSx }}
      >
        <SearchSyncToolbar
          {...{
            title,
            searchTerm,
            load,
            errorMessage,
          }}
          searchFieldPlaceholder={`Filter ${lowercaseRecordLabelPlural}`}
          tools={[
            ...(() => {
              const tools: (ReactNode | Tool)[] = [];
              if (
                pathToAddNew &&
                (!hideAddNewButtonOnNoFilteredData ||
                  filteredData.length > 0) &&
                (!permissionToAddNew ||
                  loggedInUserHasPermission(permissionToAddNew))
              ) {
                tools.push(
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={pathToAddNew}
                    size="small"
                  >
                    Add New {recordLabelSingular}
                  </Button>
                );
              }
              if (ViewOptionsButtonProps || views) {
                tools.push(viewOptionsTool);
              }

              if (groupableFields) {
                tools.push(groupTool);
              }

              if (sortableFields) {
                tools.push(sortTool);
              }

              if (filterFields) {
                tools.push(filterTool);
              }

              if (modifiedStateKeys.length > 0) {
                tools.push(
                  <Tooltip title="Reset to default view">
                    <IconButton
                      onClick={() => {
                        resetToDefaultView();
                      }}
                    >
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                );
              }

              return tools;
            })(),
          ]}
          onChangeSearchTerm={(searchTerm: string) => {
            setSearchParams(
              {
                search: (() => {
                  if (searchTerm) {
                    return searchTerm;
                  } else {
                    return null;
                  }
                })(),
              },
              {
                replace: true,
              }
            );
          }}
          hasSearchTool={Boolean(searchableFields)}
          searchFieldOpen
          sx={{
            pr: `${spacing(1.75)} !important`,
            [`&>.${gridClasses.container}`]: {
              columnGap: 1,
            },
          }}
        />
        <Divider />
      </Paper>
      <Box
        {...BodyPropsRest}
        component="section"
        sx={{
          position: 'relative',
          ...BodyPropsSx,
          ...(() => {
            if (fillContentArea) {
              return {
                overflow: 'auto',
                flex: 1,
              };
            }
            return {
              overflowX: 'auto',
            };
          })(),
        }}
      >
        {(() => {
          if (filteredData.length <= 0) {
            return (
              <IconLoadingScreen
                {...{
                  recordLabelPlural,
                  recordLabelSingular,
                  pathToAddNew,
                  errorMessage,
                  load,
                  loading,
                }}
                {...IconLoadingScreenProps}
                recordsCount={filteredData.length}
              />
            );
          }
          if (viewElement) {
            return viewElement;
          }
          if (typeof children === 'function') {
            return children({
              viewType,
              data: filteredData,
              headerHeight: headerElementRef.current?.offsetHeight,
            });
          }
          return children;
        })()}
      </Box>
      {filteredData.length > 0 ? (
        <Paper
          elevation={0}
          component="footer"
          sx={{ position: 'sticky', bottom: 0, zIndex: 5 }}
        >
          <Divider />
          <DataTablePagination
            labelPlural={lowercaseRecordLabelPlural}
            lowercaseLabelPlural={lowercaseRecordLabelPlural}
            labelSingular={lowercaseRecordLabelSingular}
            filteredCount={filteredData.length}
            totalCount={data.length}
          />
        </Paper>
      ) : null}
    </Paper>
  );

  return (
    <FixedHeaderContentArea
      {...{ title }}
      BodyProps={{
        sx: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      sx={{
        px: 0,
      }}
    >
      {explorerElement}
    </FixedHeaderContentArea>
  );
};

export const RecordsExplorer = forwardRef(BaseRecordsExplorer) as <
  RecordRow extends BaseDataRow,
  View extends ViewOptionType = ViewOptionType
>(
  p: RecordsExplorerProps<RecordRow, View> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default RecordsExplorer;
