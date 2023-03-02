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
  useState,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useReactRouterDOMSearchParams } from '../../hooks/ReactRouterDOM';
import {
  SelectedSortOption,
  SortBy,
  SortableFields,
} from '../../interfaces/Sort';
import { BaseDataRow, TableColumnType } from '../../interfaces/Table';
import { PermissionCode } from '../../interfaces/Users';
import { PrimitiveDataType } from '../../interfaces/Utils';
import { sort } from '../../utils/Sort';
import { getTableMinWidth } from '../../utils/Table';
import CollapsibleSection from '../CollapsibleSection';
import DataTablePagination from '../DataTablePagination';
import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from '../FixedHeaderContentArea';
import IconLoadingScreen, {
  IconLoadingScreenProps,
} from '../IconLoadingScreen';
import RenderIfVisible from '../RenderIfVisible';
import SearchSyncToolbar from '../SearchSyncToolbar';
import Table, { TableProps, tableClasses } from '../Table';
import TimelineChart, { TimelineChartProps } from '../TimelineChart';
import FilterButton from './FilterButton';
import GroupButton from './GroupButton';
import {
  ConditionGroup,
  DataFilterField,
  DataGroup,
  FilterBySearchTerm,
  FilterOperator,
  GroupableField,
  SearchableProperty,
} from './interfaces';
import SortButton from './SortButton';
import { getSortParamsFromEncodedString } from './utils';
import ViewOptionsButton, {
  ViewOptionType,
  ViewOptionsButtonProps,
} from './ViewOptionsButton';

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

const LIST_VIEW_TYPES: ViewOptionType[] = ['List', 'Timeline'];

const PRIMITIVE_DATA_TYPES: PrimitiveDataType[] = [
  'boolean',
  'date',
  'enum',
  'number',
  'string',
];

const ENUM_TABLE_COLUMN_TYPES: TableColumnType[] = ['enum', 'email'];

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

export interface RecordsExplorerProps<RecordRow extends BaseDataRow = any>
  extends Partial<Omit<PaperProps, 'title' | 'children'>>,
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
  ViewOptionsButtonProps?: Partial<ViewOptionsButtonProps>;
  /**
   * The limit to be used to trancate the displayed data.
   *
   * @default 10
   */
  limit?: number;
  /**
   * Determines if the limit property is active or not. If true, all records will be rendered.
   *
   * @default false
   */
  noLimit?: boolean;
  /**
   * Extra props to be assigned to the Header component.
   */
  HeaderProps?: Partial<PaperProps>;
  /**
   * Extra props to be assigned to the Body component.
   */
  BodyProps?: Partial<BoxProps>;
  /**
   * Function to be called whenever the input data is filtered.
   */
  onChangeFilteredData?: (filteredData: RecordRow[]) => void;
  /**
   * Function to be called whenever filters are cleared.
   */
  onClearFilters?: () => void;
  /**
   * List of predefined data views to render input data.
   */
  views?: DataView<RecordRow>[];
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
  searchTerm?: string;
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
  /**
   * Property to use when tracking filter parameters in the url.
   *
   * @default "filterBy"
   */
  searchParamFilterById?: string;
  /**
   * Property to use when tracking sort parameters in the url.
   *
   * @default "sortBy"
   */
  searchParamSortById?: string;
  /**
   * Property to use when tracking grouping parameters in the url.
   *
   * @default "groupBy"
   */
  searchParamGroupById?: string;
  /**
   * Property to use when tracking table selected columns in the url.
   *
   * @default "selectedColumns"
   */
  searchParamSelectedColumnsId?: string;
}

export function getRecordsExplorerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiRecordsExplorer', slot);
}

export const recordsExplorerClasses: RecordsExplorerClasses =
  generateUtilityClasses('MuiRecordsExplorer', ['root']);

const slots = {
  root: ['root'],
};

export const BaseRecordsExplorer = <RecordRow extends BaseDataRow>(
  inProps: RecordsExplorerProps<RecordRow>,
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
    limit: limitProp = 10,
    noLimit = false,
    onChangeFilteredData,
    filterFields: filterFieldsProp,
    filterBy,
    sortableFields: sortableFieldsProp,
    sortBy,
    groupableFields: groupableFieldsProp,
    groupBy,
    views,
    pathToAddNew,
    permissionToAddNew,
    hideAddNewButtonOnNoFilteredData = false,
    children,
    id,
    filterBySearchTerm,
    searchableFields: searchableFieldsProp,
    getGroupableData,
    searchParamFilterById = 'filterBy',
    searchParamSortById = 'sortBy',
    searchParamGroupById = 'groupBy',
    searchParamSelectedColumnsId = 'selectedColumns',
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

  const { sx: headerPropsSx, ...headerPropsRest } = HeaderProps;
  const { sx: bodyPropsSx, ...bodyPropsRest } = BodyProps;

  const { searchParams, setSearchParams } = useReactRouterDOMSearchParams();

  // Refs
  const isInitialMountRef = useRef(true);
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const setSearchParamsRef = useRef(setSearchParams);
  const filterBySearchTermRef = useRef(filterBySearchTerm);
  const searchableFieldsRef = useRef(searchableFieldsProp);
  const filterFieldsRef = useRef(filterFieldsProp);
  const sortableFieldsRef = useRef(sortableFieldsProp);
  const groupableFieldsRef = useRef(groupableFieldsProp);
  const getGroupableDataRef = useRef(getGroupableData);
  const onChangeFilteredDataRef = useRef(onChangeFilteredData);
  const viewsRef = useRef(views);
  useEffect(() => {
    filterBySearchTermRef.current = filterBySearchTerm;
    setSearchParamsRef.current = setSearchParams;
    searchableFieldsRef.current = searchableFieldsProp;
    groupableFieldsRef.current = groupableFieldsProp;
    sortableFieldsRef.current = sortableFieldsProp;
    filterFieldsRef.current = filterFieldsProp;
    getGroupableDataRef.current = getGroupableData;
    onChangeFilteredDataRef.current = onChangeFilteredData;
    viewsRef.current = views;
  }, [
    filterBySearchTerm,
    filterFieldsProp,
    getGroupableData,
    groupableFieldsProp,
    onChangeFilteredData,
    searchableFieldsProp,
    setSearchParams,
    sortableFieldsProp,
    views,
  ]);

  // URL Search params
  const {
    SEARCH_TERM_SEARCH_PARAM_KEY,
    LIMIT_SEARCH_PARAM_KEY,
    SEARCH_PARAM_FILTER_BY_ID,
    SEARCH_PARAM_SORT_BY_ID,
    SEARCH_PARAM_GROUP_BY_ID,
    SEARCH_PARAM_SELECTED_COLUMNS_ID,
    SEARCH_PARAM_EXPANDED_GROUPS_ID,
  } = useMemo(() => {
    const urlSearchParamsSuffix = (() => {
      if (id) {
        return `:${id}`;
      }
      return '';
    })();
    return {
      SEARCH_TERM_SEARCH_PARAM_KEY: `search${urlSearchParamsSuffix}`,
      LIMIT_SEARCH_PARAM_KEY: `limit${urlSearchParamsSuffix}`,
      SEARCH_PARAM_FILTER_BY_ID: `${searchParamFilterById}${urlSearchParamsSuffix}`,
      SEARCH_PARAM_SORT_BY_ID: `${searchParamSortById}${urlSearchParamsSuffix}`,
      SEARCH_PARAM_GROUP_BY_ID: `${searchParamGroupById}${urlSearchParamsSuffix}`,
      SEARCH_PARAM_SELECTED_COLUMNS_ID: `${searchParamSelectedColumnsId}${urlSearchParamsSuffix}`,
      SEARCH_PARAM_EXPANDED_GROUPS_ID: 'expandedGroups',
    };
  }, [
    id,
    searchParamFilterById,
    searchParamGroupById,
    searchParamSelectedColumnsId,
    searchParamSortById,
  ]);

  const { palette, spacing } = useTheme();

  const [viewType, setViewType] = useState<ViewOptionType>('List');

  const [processingDisplayData, setProcessingDisplayData] = useState(false);

  const [limit, setLimit] = useState(limitProp);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [allGroupsExpanded, setAllGroupsExpanded] = useState(false);

  // Resolving data operation fields
  const { filterFields, sortableFields, groupableFields, searchableFields } =
    useMemo(() => {
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
                .filter(({ id, label, type = 'string' }) => {
                  return (
                    typeof label === 'string' &&
                    !sortableFields.find(
                      ({ id: sortableFieldId }) => sortableFieldId === id
                    ) &&
                    PRIMITIVE_DATA_TYPES.includes(type as PrimitiveDataType)
                  );
                })
                .map(({ id, label, type = 'string' }) => {
                  return {
                    id,
                    label: String(label),
                    type: type as PrimitiveDataType,
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
                .filter(({ id, label, type = 'string' }) => {
                  return (
                    typeof label === 'string' &&
                    !filterFields.find(
                      ({ id: filterFieldId }) => filterFieldId === id
                    ) &&
                    PRIMITIVE_DATA_TYPES.includes(type as PrimitiveDataType)
                  );
                })
                .map(({ id, label, type = 'string', getColumnValue }) => {
                  return {
                    id,
                    label: String(label),
                    type: type as any,
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

  const searchParamSearchTerm = searchParams.get(
    SEARCH_TERM_SEARCH_PARAM_KEY
  ) as string | null;
  const searchParamLimit = searchParams.get(LIMIT_SEARCH_PARAM_KEY) as
    | string
    | null;
  const searchParamExpandedGroups = searchParams.get(
    SEARCH_PARAM_EXPANDED_GROUPS_ID
  ) as string | null;

  const [searchTerm, setSearchTerm] = useState(searchParamSearchTerm ?? '');

  const searchParamFilterBy = searchParams.get(SEARCH_PARAM_FILTER_BY_ID) as
    | string
    | null;
  const searchParamSortBy =
    (searchParams.get(SEARCH_PARAM_SORT_BY_ID) as string) || null;
  const searchParamGroupBy =
    (searchParams.get(SEARCH_PARAM_GROUP_BY_ID) as string) || null;
  const searchParamSelectedColumns =
    (searchParams.get(SEARCH_PARAM_SELECTED_COLUMNS_ID) as string) || null;

  const isListViewType = LIST_VIEW_TYPES.includes(viewType);

  const { loggedInUserHasPermission } = useAuth();

  const [filteredData, setFilteredData] = useState<RecordRow[]>([]);
  const [groupedData, setGroupedData] = useState<DataGroup<RecordRow>[] | null>(
    null
  );

  // Filter fields state
  const baseConditionGroup = useMemo(() => {
    return {
      conjunction: 'and',
      conditions: [],
    } as ConditionGroup<RecordRow>;
  }, []);

  const [selectedConditionGroup, setSelectedConditionGroup] =
    useState(baseConditionGroup);
  const [activeConditionGroup, setActiveConditionGroup] =
    useState(baseConditionGroup);

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

  const [selectedColumnIds, setSelectedColumnIds] = useState<
    (keyof RecordRow)[]
  >(baseSelectedColumnIds || []);

  // Setting selected columns from search params
  useEffect(() => {
    if (searchParamSelectedColumns) {
      setSelectedColumnIds((prevSelectedColumnIds) => {
        const nextSelectedColumnIds = searchParamSelectedColumns
          .split(',')
          .map((selectedColumnId) => decodeURIComponent(selectedColumnId));
        if (nextSelectedColumnIds.join() !== prevSelectedColumnIds.join()) {
          return nextSelectedColumnIds as typeof prevSelectedColumnIds;
        }
        return prevSelectedColumnIds;
      });
    } else if (baseSelectedColumnIds) {
      setSelectedColumnIds(baseSelectedColumnIds);
    }
  }, [
    SEARCH_PARAM_SELECTED_COLUMNS_ID,
    baseSelectedColumnIds,
    searchParamSelectedColumns,
  ]);

  const setDefaultFilterByRef = useRef(() => {
    if (filterBy) {
      setActiveConditionGroup({
        ...filterBy,
        conjunction: filterBy.conjunction || 'and',
      });
    } else {
      setActiveConditionGroup(baseConditionGroup);
    }
  });

  // Setting default field filter
  useEffect(() => {
    if (isInitialMountRef.current && !searchParamFilterBy) {
      setDefaultFilterByRef.current();
    }
  }, [searchParamFilterBy, filterBy]);

  useEffect(() => {
    if (searchParamFilterBy && JSON.isValid(searchParamFilterBy)) {
      setActiveConditionGroup((prevConditionGroup) => {
        if (JSON.stringify(prevConditionGroup) !== searchParamFilterBy) {
          return JSON.parse(searchParamFilterBy) as ConditionGroup<RecordRow>;
        }
        return prevConditionGroup;
      });
    }
  }, [baseConditionGroup, searchParamFilterBy]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      if (selectedConditionGroup.conditions.length > 0) {
        setSearchParamsRef.current(
          {
            [SEARCH_PARAM_FILTER_BY_ID]: JSON.stringify(selectedConditionGroup),
          },
          { replace: true }
        );
      } else {
        setActiveConditionGroup(selectedConditionGroup);
        setSearchParamsRef.current(
          {
            [SEARCH_PARAM_FILTER_BY_ID]: null,
          },
          { replace: true }
        );
      }
    }
  }, [SEARCH_PARAM_FILTER_BY_ID, selectedConditionGroup]);

  /****************************************
   * Sort params
   ****************************************/
  const [activeSortParams, setActiveSortParams] = useState<
    SelectedSortOption<RecordRow>[]
  >([]);
  const [selectedSortParams, setSelectedSortParams] = useState<
    SelectedSortOption<RecordRow>[]
  >([]);

  // Setting default sort params
  useEffect(() => {
    if (
      isInitialMountRef.current &&
      sortableFields &&
      !searchParamSortBy &&
      sortBy
    ) {
      setActiveSortParams((prevSelectedSortParams) => {
        if (
          sortBy
            .map(({ id, sortDirection }) => String(id) + sortDirection)
            .join(',') !==
          prevSelectedSortParams
            .map(({ id, sortDirection }) => String(id) + sortDirection)
            .join(',')
        ) {
          return sortBy
            .map((sortBy) => {
              const { id } = sortBy;
              return [
                sortableFields.find(({ id: currentId }) => currentId === id)!,
                sortBy,
              ];
            })
            .filter(([selectedSortParam]) => selectedSortParam != null)
            .map(([selectedSortParam, { sortDirection }]) => {
              return {
                ...selectedSortParam,
                sortDirection: sortDirection || 'ASC',
              } as SelectedSortOption<RecordRow>;
            });
        }
        return prevSelectedSortParams;
      });
    }
  }, [searchParamSortBy, sortBy, sortableFields]);

  useEffect(() => {
    if (searchParamSortBy && sortableFields) {
      setActiveSortParams(
        getSortParamsFromEncodedString<RecordRow>(
          searchParamSortBy,
          sortableFields
        )
      );
    }
  }, [searchParamSortBy, sortableFields]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      if (selectedSortParams.length > 0) {
        setSearchParamsRef.current(
          {
            [SEARCH_PARAM_SORT_BY_ID]: selectedSortParams
              .map(({ id, sortDirection }) => {
                return encodeURIComponent(
                  `${String(id)}|${sortDirection || 'ASC'}`
                );
              })
              .join(','),
          },
          {
            replace: true,
          }
        );
      } else {
        setSearchParamsRef.current(
          { [SEARCH_PARAM_SORT_BY_ID]: null },
          { replace: true }
        );
      }
    }
  }, [SEARCH_PARAM_SORT_BY_ID, selectedSortParams]);

  /****************************************
   * Group params
   ****************************************/
  const [activeGroupParams, setActiveGroupParams] = useState<
    SelectedSortOption<RecordRow>[]
  >([]);
  const [selectedGroupParams, setSelectedGroupParams] = useState<
    SelectedSortOption<RecordRow>[]
  >([]);

  // Setting default group params
  useEffect(() => {
    if (
      isInitialMountRef.current &&
      !searchParamGroupBy &&
      groupableFields &&
      groupBy
    ) {
      setActiveGroupParams((prevSelectedGroupParams) => {
        if (
          groupBy.map(({ id }) => id).join(',') !==
          prevSelectedGroupParams.map(({ id }) => id).join(',')
        ) {
          return groupBy
            .map((groupBy) => {
              const { id } = groupBy;
              return [
                groupableFields.find(({ id: currentId }) => currentId === id)!,
                groupBy,
              ];
            })
            .filter(([selectedGroupParam]) => selectedGroupParam != null)
            .map(([selectedGroupParam, { sortDirection }]) => {
              return {
                ...selectedGroupParam,
                sortDirection: sortDirection || 'ASC',
              } as SelectedSortOption<RecordRow>;
            });
        }
        return prevSelectedGroupParams;
      });
    }
  }, [searchParamGroupBy, groupBy, groupableFields]);

  useEffect(() => {
    if (searchParamGroupBy && groupableFields) {
      setActiveGroupParams(
        getSortParamsFromEncodedString<RecordRow>(
          searchParamGroupBy,
          groupableFields
        )
      );
    } else if (!isInitialMountRef.current) {
      setActiveGroupParams([]);
    }
  }, [searchParamGroupBy, groupableFields]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      if (selectedGroupParams.length > 0) {
        setSearchParamsRef.current(
          {
            [SEARCH_PARAM_GROUP_BY_ID]: selectedGroupParams
              .map(({ id, sortDirection }) => {
                return encodeURIComponent(
                  `${String(id)}|${sortDirection || 'ASC'}`
                );
              })
              .join(','),
          },
          {
            replace: true,
          }
        );
      } else {
        setSearchParamsRef.current(
          {
            [SEARCH_PARAM_GROUP_BY_ID]: null,
            [SEARCH_PARAM_EXPANDED_GROUPS_ID]: null,
          },
          { replace: true }
        );
      }
    }
  }, [
    SEARCH_PARAM_EXPANDED_GROUPS_ID,
    SEARCH_PARAM_GROUP_BY_ID,
    selectedGroupParams,
  ]);

  // Processing data
  useEffect(() => {
    // Filtering data
    const dataFilteredByFilterFields = (() => {
      if (filterFields) {
        if (activeConditionGroup.conditions.length > 0) {
          const emptyfilterOperators: FilterOperator[] = [
            'is empty',
            'is not empty',
          ];
          return data.filter((row) => {
            return activeConditionGroup.conditions
              .filter(({ operator, value }) => {
                return (
                  emptyfilterOperators.includes(operator) ||
                  (value != null && String(value).length > 0)
                );
              })
              [activeConditionGroup.conjunction === 'and' ? 'every' : 'some'](
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
      if (activeSortParams && activeSortParams.length > 0) {
        return [...filteredData].sort((a, b) => {
          return sort(a, b, activeSortParams);
        });
      }
      return filteredData;
    })();

    setFilteredData(sortedData);
  }, [
    activeConditionGroup.conditions,
    activeConditionGroup.conjunction,
    activeSortParams,
    data,
    filterFields,
    searchParamSortBy,
    searchTerm,
    searchableFields,
    sortableFields,
  ]);

  // Grouping data
  useEffect(() => {
    const groupedData = (() => {
      if (searchParamGroupBy && groupableFields) {
        const activeGroupParams = getSortParamsFromEncodedString(
          searchParamGroupBy,
          groupableFields
        );
        if (activeGroupParams.length > 0) {
          const groupParams = activeGroupParams.map((groupParam) => {
            return {
              ...groupableFields!.find(({ id }) => id == groupParam.id)!,
              ...groupParam,
            };
          });
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
      }
      return null;
    })();
    setGroupedData(groupedData);
  }, [filteredData, groupableFields, searchParamGroupBy]);

  // Initial mount ref
  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  // Search param `limit` transfer.
  useEffect(() => {
    if (noLimit) {
      setSearchParamsRef.current(
        {
          [LIMIT_SEARCH_PARAM_KEY]: null,
        },
        {
          replace: true,
        }
      );
    } else {
      if (
        searchParamLimit &&
        searchParamLimit.match(/^\d+$/g) &&
        parseInt(searchParamLimit) >= limitProp
      ) {
        setLimit(parseInt(searchParamLimit));
      } else {
        setSearchParamsRef.current(
          {
            [LIMIT_SEARCH_PARAM_KEY]: String(limitProp),
          },
          {
            replace: true,
          }
        );
      }
    }
  }, [LIMIT_SEARCH_PARAM_KEY, limitProp, noLimit, searchParamLimit]);

  // Search param `expandedGroups` transfer.
  useEffect(() => {
    if (!searchParamExpandedGroups || searchParamExpandedGroups === 'All') {
      setExpandedGroups([]);
      setAllGroupsExpanded(true);
    } else {
      setAllGroupsExpanded(false);
      setExpandedGroups((prevGroups) => {
        const nextGroups = searchParamExpandedGroups
          .split(',')
          .map((group) => decodeURIComponent(group));
        if (nextGroups.join(',') !== prevGroups.join(',')) {
          return nextGroups;
        }
        return prevGroups;
      });
    }
  }, [searchParamExpandedGroups]);

  useEffect(() => {
    setSearchTerm(searchParamSearchTerm ?? '');
  }, [searchParamSearchTerm]);

  useEffect(() => {
    setProcessingDisplayData(false);
    if (onChangeFilteredDataRef.current) {
      onChangeFilteredDataRef.current(filteredData);
    }
  }, [filteredData]);

  useEffect(() => {
    setProcessingDisplayData(true);
  }, [data]);

  const resetToDefaultView = () => {
    setSearchParams(
      {
        [SEARCH_PARAM_FILTER_BY_ID]: null,
        [SEARCH_PARAM_GROUP_BY_ID]: null,
        [SEARCH_PARAM_SORT_BY_ID]: null,
        [SEARCH_TERM_SEARCH_PARAM_KEY]: null,
        [SEARCH_PARAM_SELECTED_COLUMNS_ID]: null,
      },
      {
        replace: true,
      }
    );
    setDefaultFilterByRef.current();
  };

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
                    sortBy: activeSortParams,
                    onChangeSortBy: (sortOptions) => {
                      if (sortableFields) {
                        setSelectedSortParams((prevSelectedSortParams) => {
                          if (
                            sortOptions
                              .map(
                                ({ id, sortDirection }) =>
                                  String(id) + sortDirection
                              )
                              .join(',') !==
                            prevSelectedSortParams
                              .map(
                                ({ id, sortDirection }) =>
                                  String(id) + sortDirection
                              )
                              .join(',')
                          ) {
                            return sortOptions
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
                              });
                          }
                          return prevSelectedSortParams;
                        });
                      }
                    },
                    onChangeSelectedColumnIds: (localSelectedColumnIds) => {
                      if (selectedColumnIds !== localSelectedColumnIds) {
                        setSearchParams(
                          {
                            [SEARCH_PARAM_SELECTED_COLUMNS_ID]:
                              localSelectedColumnIds
                                .map((selectedColumnId) =>
                                  encodeURIComponent(String(selectedColumnId))
                                )
                                .join(','),
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
                                  [SEARCH_PARAM_EXPANDED_GROUPS_ID]:
                                    allGroupsExpanded ? 'None' : 'All',
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
                                          [SEARCH_PARAM_EXPANDED_GROUPS_ID]:
                                            (() => {
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
                                                return groups
                                                  .map((group) =>
                                                    encodeURIComponent(group)
                                                  )
                                                  .join(',');
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
        {...headerPropsRest}
        ref={headerElementRef}
        component="header"
        sx={{ position: 'sticky', top: 0, zIndex: 10, ...headerPropsSx }}
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
              const tools: ReactNode[] = [];
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
                tools.push(
                  <ViewOptionsButton
                    viewOptionTypes={(() => {
                      if (views) {
                        return views.map(({ type }) => type);
                      }
                    })()}
                    {...ViewOptionsButtonProps}
                    {...{ id }}
                    onChangeViewType={(viewType) => {
                      setViewType(viewType);
                    }}
                  />
                );
              }

              if (groupableFields) {
                tools.push(
                  <GroupButton
                    {...{
                      groupableFields,
                      groupBy,
                      getGroupableData,
                      id,
                    }}
                    selectedGroupParams={activeGroupParams}
                    onChangeSelectedGroupParams={(groupParams) => {
                      setSelectedGroupParams(groupParams);
                    }}
                  />
                );
              }

              if (sortableFields) {
                tools.push(
                  <SortButton
                    {...{ sortableFields, sortBy, id }}
                    selectedSortParams={activeSortParams}
                    onChangeSelectedSortParams={(sortParams) => {
                      setSelectedSortParams(sortParams);
                    }}
                  />
                );
              }

              if (filterFields) {
                tools.push(
                  <FilterButton
                    {...{ data, filterFields, id }}
                    selectedConditionGroup={activeConditionGroup}
                    onChangeSelectedConditionGroup={(conditionGroup) => {
                      setSelectedConditionGroup(conditionGroup);
                    }}
                  />
                );
              }

              if (
                searchParamFilterBy ||
                searchParamGroupBy ||
                searchParamSortBy ||
                searchParamSelectedColumns ||
                searchParamSearchTerm
              ) {
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
                [SEARCH_TERM_SEARCH_PARAM_KEY]: (() => {
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
        {...bodyPropsRest}
        component="section"
        sx={{
          position: 'relative',
          ...bodyPropsSx,
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
                }}
                {...IconLoadingScreenProps}
                recordsCount={filteredData.length}
                loading={loading || processingDisplayData}
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
            rowsPerPage={!noLimit && isListViewType ? limit : undefined}
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
  RecordRow extends BaseDataRow
>(
  p: RecordsExplorerProps<RecordRow> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default RecordsExplorer;
