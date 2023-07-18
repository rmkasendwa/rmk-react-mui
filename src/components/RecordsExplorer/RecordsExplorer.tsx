import '@infinite-debugger/rmk-js-extensions/JSON';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
  Box,
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  Paper,
  PaperProps,
  Tooltip,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  tableContainerClasses,
  tableHeadClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { FormikValues } from 'formik';
import hashIt from 'hash-it';
import { omit, result } from 'lodash';
import { singular } from 'pluralize';
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
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import { LoadingContext, LoadingProvider } from '../../contexts/LoadingContext';
import { useMessagingContext } from '../../contexts/MessagingContext';
import {
  ParamStorage,
  useReactRouterDOMSearchParams,
} from '../../hooks/ReactRouterDOM';
import {
  PaginatedRecordsFinderOptions,
  PaginatedRecordsOptions,
  useCreate,
  usePaginatedRecords,
  useRecord,
  useUpdate,
} from '../../hooks/Utils';
import {
  SelectedSortOption,
  SortBy,
  SortDirection,
  SortableFields,
  sortDirections,
} from '../../models/Sort';
import { PermissionCode } from '../../models/Users';
import {
  CrudMode,
  PaginatedResponseData,
  PrimitiveDataType,
} from '../../models/Utils';
import { sort } from '../../utils/Sort';
import DataTablePagination from '../DataTablePagination';
import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from '../FixedHeaderContentArea';
import IconLoadingScreen, {
  IconLoadingScreenProps,
} from '../IconLoadingScreen';
import DataDropdownField from '../InputFields/DataDropdownField';
import ModalForm, {
  ModalFormFunctionChildren,
  ModalFormProps,
} from '../ModalForm';
import { DropdownOption } from '../PaginatedDropdownOptionList';
import SearchSyncToolbar, {
  SearchSyncToolbarProps,
  Tool,
} from '../SearchSyncToolbar';
import Table, {
  BaseDataRow,
  TableColumnType,
  TableProps,
  mapTableColumnTypeToPrimitiveDataType,
} from '../Table';
import Timeline, {
  ScrollToDateFunction,
  SelectTimeScaleCallbackFunction,
  TimeScaleOption,
  TimelineProps,
  timelineSearchParamValidationSpec,
  useScrollTimelineTools,
  useTimeScaleTool,
} from '../Timeline';
import { useFilterTool } from './hooks/FilterTool';
import { useGroupTool } from './hooks/GroupTool';
import { useSortTool } from './hooks/SortTool';
import {
  ViewOptionType,
  ViewOptionsToolOptions,
  useViewOptionsTool,
} from './hooks/ViewOptionsTool';
import {
  ConditionGroup,
  Conjunction,
  DataFilterField,
  DataGroup,
  FilterBySearchTerm,
  FilterOperator,
  GroupableField,
  NestedDataGroup,
  RecordsExplorerRowField,
  SearchableProperty,
  filterConjunctions,
  filterOperators,
} from './models';

export interface RecordsExplorerClasses {
  /** Styles applied to the root element. */
  root: string;
  header: string;
  section: string;
  footer: string;
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

const ENUM_TABLE_COLUMN_TYPES: TableColumnType[] = ['enum'];

export interface BaseDataView {
  type: ViewOptionType;
  minWidth?: number;
  mergeTools?: boolean;
}

export interface ListView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Partial<Omit<TableProps<RecordRow>, 'rows' | 'columns' | 'minWidth'>> {
  type: 'List';
  columns: RecordsExplorerRowField<RecordRow>[];
}

export interface TimelineView<RecordRow extends BaseDataRow>
  extends BaseDataView,
    Partial<Omit<TimelineProps<RecordRow>, 'rows'>> {
  type: 'Timeline';
}

export type DataView<RecordRow extends BaseDataRow> =
  | ListView<RecordRow>
  | TimelineView<RecordRow>;

export interface RecordsExplorerChildrenOptions<RecordRow extends BaseDataRow> {
  selectedView: ViewOptionType;
  data: RecordRow[];
  headerHeight?: number;
  filterFields?: DataFilterField<RecordRow>[];
  filterBy?: Omit<ConditionGroup<RecordRow>, 'conjunction'> &
    Partial<Pick<ConditionGroup<RecordRow>, 'conjunction'>>;
  sortableFields?: SortableFields<RecordRow>;
  sortBy?: SortBy<RecordRow>;
  groupableFields?: GroupableField<RecordRow>[];
  groupBy?: SortBy<RecordRow>;
  loading?: boolean;
  errorMessage?: string;
  searchParamSelectedDataPreset?: string | number;
  selectedDataPreset?: RecordsExplorerDataPreset<RecordRow>;
}

export type RecordsExplorerTools = Partial<
  Record<
    | 'ADD_NEW'
    | 'VIEW_OPTIONS'
    | 'GROUP'
    | 'SORT'
    | 'FILTER'
    | 'RESET_TO_DEFAULT_VIEW'
    | 'TIMELINE_TIME_SCALE'
    | 'TIMELINE_SCROLL',
    Tool | ReactNode
  >
>;

export type RecordsExplorerToolsPreprocessorFunction<
  RecordRow extends BaseDataRow
> = (
  options: {
    tools: RecordsExplorerTools;
  } & RecordsExplorerChildrenOptions<RecordRow>
) => (Tool | ReactNode)[];

export interface RecordsExplorerFunctionChildren<State> {
  (state: State): ReactNode;
}

export type RecordsExplorerFunctionEditorForm<
  RecordRow extends BaseDataRow = BaseDataRow,
  InitialValues extends FormikValues = FormikValues
> = ModalFormFunctionChildren<
  InitialValues,
  {
    mode: CrudMode;
    selectedRecord?: RecordRow | null;
    loadingState: LoadingContext;
  }
>;

export type RecordsFinder<RecordRow extends BaseDataRow = BaseDataRow> = (
  options: PaginatedRecordsFinderOptions
) => Promise<PaginatedResponseData<RecordRow> | RecordRow[]>;

export type RecordsExplorerDataPreset<
  RecordRow extends BaseDataRow = BaseDataRow
> = {
  title: ReactNode;
  key?: string;
  recordsFinder: RecordsFinder<RecordRow>;
};

export interface RecordsExplorerProps<
  RecordRow extends BaseDataRow = BaseDataRow,
  View extends ViewOptionType = ViewOptionType,
  InitialValues extends FormikValues = FormikValues
> extends Partial<Omit<PaperProps, 'title' | 'children'>>,
    Partial<Pick<FixedHeaderContentAreaProps, 'title'>>,
    Partial<
      Pick<
        TableProps<RecordRow>,
        | 'enableSmallScreenOptimization'
        | 'enableCheckboxAllRowSelector'
        | 'enableCheckboxRowSelectors'
        | 'showRowNumber'
      >
    >,
    Partial<
      Pick<ModalFormProps<InitialValues>, 'validationSchema' | 'editableFields'>
    >,
    Pick<
      PaginatedRecordsOptions<RecordRow>,
      'revalidationKey' | 'autoSync' | 'refreshInterval'
    > {
  getTitle?: RecordsExplorerFunctionChildren<
    RecordsExplorerChildrenOptions<RecordRow>
  >;
  getWrappedTitle?: RecordsExplorerFunctionChildren<
    RecordsExplorerChildrenOptions<RecordRow> & {
      title: ReactNode;
    }
  >;
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
  data?: RecordRow[];
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
   * Extra props to be assigned to the ViewOptionsTool component.
   */
  ViewOptionsToolProps?: Partial<ViewOptionsToolOptions>;
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
  selectedView?: View;
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
  controlledSearchTerm?: string;
  isSearchable?: boolean;
  /**
   * Function to be called when user searches.
   */
  filterBySearchTerm?: FilterBySearchTerm<RecordRow>;
  /**
   * The searchable properties on the input data set records.
   */
  searchableFields?: SearchableProperty<RecordRow>[];
  SearchSyncToolBarProps?: Partial<SearchSyncToolbarProps>;
  filterFields?: DataFilterField<RecordRow>[];
  sortableFields?: SortableFields<RecordRow>;
  groupableFields?: GroupableField<RecordRow>[];
  fields?: RecordsExplorerRowField<RecordRow>[];
  filterBy?: Omit<ConditionGroup<RecordRow>, 'conjunction'> &
    Partial<Pick<ConditionGroup<RecordRow>, 'conjunction'>>;
  sortBy?: SortBy<RecordRow>;
  groupBy?: SortBy<RecordRow>;
  getGroupableData?: (
    data: RecordRow[],
    grouping: GroupableField<RecordRow>
  ) => RecordRow[];
  showPaginationStats?:
    | boolean
    | ((state: RecordsExplorerChildrenOptions<RecordRow>) => boolean);

  // Form
  editorForm?:
    | RecordsExplorerFunctionEditorForm<RecordRow, InitialValues>
    | ReactNode;
  description?: ReactNode;
  recordsFinder?: RecordsFinder<RecordRow>;
  getRecordLoadFunction?: (loadFunction: () => void) => void;
  recordDetailsFinder?: (selectedRecordId: string) => Promise<RecordRow>;
  getRecordDetailsLoadFunction?: (loadFunction: () => void) => void;
  getEditableRecordInitialValues?: (record: RecordRow) => any;
  recordCreator?: (values: InitialValues) => any;
  onCreateNewRecord?: (createdRecord: RecordRow) => void;
  recordEditor?: (record: RecordRow, values: InitialValues) => any;
  recordDeletor?: (record: RecordRow) => any;
  initialValues?: InitialValues;
  editValidationSchema?: any | (() => any);
  defaultPath?: string;
  getTableDataReloadFunction?: (reloadFunction: () => void) => void;
  getCreateFunction?: (createFunction: () => void) => void;
  getViewFunction?: (viewFunction: (record: RecordRow) => void) => void;
  getEditFunction?: (editFunction: (record: RecordRow) => void) => void;
  getDeleteFunction?: (editFunction: (record: RecordRow) => void) => void;
  onEditRecord?: () => void;
  getToolbarElement?: (toolbarElement: ReactElement) => ReactElement;

  // View Path
  templatePathToView?: string;
  pathToView?: string;
  getPathToView?: (record: RecordRow) => string;
  getViewTitle?: (record: RecordRow) => ReactNode;

  // Edit Path
  templatePathToEdit?: string;
  pathToEdit?: string;
  getPathToEdit?: (record: RecordRow) => string;

  showRecords?: boolean;

  getRecordTools?: (record: RecordRow) => DropdownOption[];
  extraActionsColumnWidth?: number;
  ModalFormProps?: Partial<ModalFormProps>;
  CreateModalFormProps?: Partial<ModalFormProps>;
  ViewModalFormProps?: Partial<ModalFormProps>;
  recordCreateSuccessMessage?: ReactNode;
  recordEditSuccessMessage?: ReactNode;
  addNewButtonLabel?: ReactNode;

  showViewOptionsTool?: boolean;
  showGroupTool?:
    | boolean
    | ((state: RecordsExplorerChildrenOptions<RecordRow>) => boolean);
  showSortTool?: boolean;
  showFilterTool?: boolean;
  stateStorage?: ParamStorage;
  PaginatedRecordsOptions?: Partial<PaginatedRecordsOptions<RecordRow>>;
  dataPresets?: RecordsExplorerDataPreset<RecordRow>[];
  selectedDataPresetId?: string | number;
  tools?: Tool[];
  bottomTools?: Tool[];
  getBottomTools?: (
    state: RecordsExplorerChildrenOptions<RecordRow>
  ) => (ReactNode | Tool)[] | undefined;
  ListViewProps?: Partial<Omit<ListView<RecordRow>, 'columns'>>;
  TimelineViewProps?: Partial<Omit<TimelineView<RecordRow>, 'columns'>>;
  clearSearchStateOnUnmount?: boolean;
  showSuccessMessageOnCreateRecord?: boolean;
  preprocessTools?: RecordsExplorerToolsPreprocessorFunction<RecordRow>;
}

export function getRecordsExplorerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiRecordsExplorer', slot);
}

export const recordsExplorerClasses: RecordsExplorerClasses =
  generateUtilityClasses('MuiRecordsExplorer', [
    'root',
    'header',
    'section',
    'footer',
  ]);

const slots = {
  root: ['root'],
  header: ['header'],
  section: ['section'],
  footer: ['footer'],
};

const BaseRecordsExplorer = <
  RecordRow extends BaseDataRow,
  View extends ViewOptionType,
  InitialValues extends FormikValues
>(
  inProps: RecordsExplorerProps<RecordRow, View, InitialValues>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiRecordsExplorer' });
  const {
    className,
    title: titleProp,
    getTitle,
    getWrappedTitle,
    sx,
    fillContentArea = true,
    load: loadProp,
    loading: loadingProp,
    errorMessage: errorMessageProp,
    HeaderProps = {},
    BodyProps = {},
    IconLoadingScreenProps = {},
    data: dataProp,
    ViewOptionsToolProps,
    filterFields: filterFieldsProp,
    sortableFields: sortableFieldsProp,
    sortBy: sortByProp,
    groupableFields: groupableFieldsProp,
    groupBy: groupByProp,
    filterBy: filterByProp,
    views,
    selectedView: viewProp,
    pathToAddNew,
    permissionToAddNew,
    hideAddNewButtonOnNoFilteredData = false,
    children,
    filterBySearchTerm,
    searchableFields: searchableFieldsProp,
    getGroupableData,
    SearchSyncToolBarProps = {},
    showPaginationStats = true,
    enableSmallScreenOptimization: enableSmallScreenOptimizationProp = true,
    enableCheckboxAllRowSelector: enableCheckboxAllRowSelectorProp,
    enableCheckboxRowSelectors: enableCheckboxRowSelectorsProp,
    showRowNumber: showRowNumberProp,
    id,
    recordCreator,
    onCreateNewRecord,
    editorForm,
    validationSchema,
    initialValues,
    ModalFormProps = {},
    CreateModalFormProps = {},
    ViewModalFormProps = {},
    description,
    autoSync = true,
    defaultPath,
    recordDetailsFinder,
    recordEditor,
    editableFields,
    editValidationSchema,
    getViewTitle,
    onEditRecord,
    pathToEdit,
    getPathToEdit,
    getEditableRecordInitialValues,
    recordsFinder,
    showRecords,
    revalidationKey,
    recordDeletor,
    getRecordTools,
    recordCreateSuccessMessage,
    recordEditSuccessMessage,
    pathToView,
    getPathToView,
    searchTerm: searchTermProp,
    isSearchable: isSearchableProp = true,
    controlledSearchTerm,
    showViewOptionsTool = true,
    showGroupTool = true,
    showSortTool = true,
    showFilterTool = true,
    stateStorage,
    getViewFunction,
    getRecordLoadFunction,
    getRecordDetailsLoadFunction,
    refreshInterval,
    PaginatedRecordsOptions,
    dataPresets,
    selectedDataPresetId: selectedDataPresetIdProp,
    tools: toolsProp,
    bottomTools: bottomToolsProp,
    getBottomTools,
    ListViewProps,
    TimelineViewProps,
    fields,
    clearSearchStateOnUnmount = false,
    showSuccessMessageOnCreateRecord = true,
    preprocessTools,
    ...rest
  } = omit(
    props,
    'recordLabelPlural',
    'recordLabelSingular',
    'permissionToViewDetails',
    'addNewButtonLabel'
  );

  let { recordLabelPlural, recordLabelSingular, addNewButtonLabel } = props;

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

  if (!recordLabelPlural) {
    if (typeof titleProp === 'string') {
      recordLabelPlural = titleProp;
    } else {
      recordLabelPlural = 'Records';
    }
  }

  recordLabelSingular || (recordLabelSingular = singular(recordLabelPlural));
  const lowercaseRecordLabelPlural = recordLabelPlural.toLowerCase();
  const lowercaseRecordLabelSingular = recordLabelSingular.toLowerCase();

  addNewButtonLabel || (addNewButtonLabel = `Add New ${recordLabelSingular}`);

  const { sx: HeaderPropsSx, ...HeaderPropsRest } = HeaderProps;
  const { sx: BodyPropsSx, ...BodyPropsRest } = BodyProps;
  const { onChangeSearchTerm, ...SearchSyncToolBarPropsRest } =
    SearchSyncToolBarProps;
  const { ...ModalFormPropsRest } = ModalFormProps;
  const { ...CreateModalFormPropsRest } = CreateModalFormProps;
  const { ...ViewModalFormPropsRest } = ViewModalFormProps;

  // Refs
  const isInitialMountRef = useRef(true);
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const bodyElementRef = useRef<HTMLDivElement | null>(null);
  const filterBySearchTermRef = useRef(filterBySearchTerm);
  filterBySearchTermRef.current = filterBySearchTerm;
  const searchableFieldsRef = useRef(searchableFieldsProp);
  searchableFieldsRef.current = searchableFieldsProp;
  const filterFieldsRef = useRef(filterFieldsProp);
  filterFieldsRef.current = filterFieldsProp;
  const sortableFieldsRef = useRef(sortableFieldsProp);
  sortableFieldsRef.current = sortableFieldsProp;
  const groupableFieldsRef = useRef(groupableFieldsProp);
  groupableFieldsRef.current = groupableFieldsProp;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const sortByPropRef = useRef(sortByProp);
  sortByPropRef.current = sortByProp;
  const getGroupableDataRef = useRef(getGroupableData);
  getGroupableDataRef.current = getGroupableData;
  const viewsRef = useRef(views);
  viewsRef.current = views;
  const filterByPropRef = useRef(filterByProp);
  filterByPropRef.current = filterByProp;
  const getEditableRecordInitialValuesRef = useRef(
    getEditableRecordInitialValues
  );
  getEditableRecordInitialValuesRef.current = getEditableRecordInitialValues;
  const getViewFunctionRef = useRef(getViewFunction);
  getViewFunctionRef.current = getViewFunction;

  const getRecordLoadFunctionRef = useRef(getRecordLoadFunction);
  getRecordLoadFunctionRef.current = getRecordLoadFunction;

  const getRecordDetailsLoadFunctionRef = useRef(getRecordDetailsLoadFunction);
  getRecordDetailsLoadFunctionRef.current = getRecordDetailsLoadFunction;

  const dataPresetsRef = useRef(dataPresets);
  dataPresetsRef.current = dataPresets;
  const ListViewPropsRef = useRef(ListViewProps);
  ListViewPropsRef.current = ListViewProps;

  const resetTimelineToDefaultViewRef = useRef<() => void>();

  const viewFunctionRef = useRef((record: RecordRow) => {
    const { id } = record;
    const pathToViewRecord = (() => {
      if (pathToView) {
        return pathToView;
      }
      if (getPathToView) {
        return getPathToView(record);
      }
      return addSearchParamsToPath(pathname, {
        selectedRecord: id,
      });
    })();
    navigate(pathToViewRecord);
  });

  useEffect(() => {
    if (getViewFunctionRef.current) {
      getViewFunctionRef.current(viewFunctionRef.current);
    }
  }, []);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const descriptionElement = (() => {
    if (description) {
      return (
        <Grid
          item
          sx={{
            display: 'flex',
          }}
        >
          <Tooltip title={description}>
            <HelpIcon
              sx={{
                fontSize: 18,
              }}
            />
          </Tooltip>
        </Grid>
      );
    }
  })();

  //#region Resolving data operation fields
  const { filterFields, sortableFields, groupableFields, searchableFields } =
    useMemo(() => {
      //#region Resolving groupable fields
      const groupableFields =
        (() => {
          const groupableFields: typeof groupableFieldsRef.current = [];
          if (groupableFieldsRef.current) {
            groupableFields.push(...groupableFieldsRef.current);
          }
          if (fieldsRef.current) {
            fieldsRef.current.forEach(
              ({
                id,
                label,
                type = 'string',
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
                    type: type as PrimitiveDataType,
                    getSortValue: getSortValue || (getFilterValue as any),
                    getGroupLabel,
                    sortLabels,
                  });
                }
              }
            );
          }
          if (viewsRef.current) {
            const listView = viewsRef.current.find(
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
                      (groupable || ENUM_TABLE_COLUMN_TYPES.includes(type))
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
          const sortableFields: typeof sortableFieldsRef.current = [];
          if (sortableFieldsRef.current) {
            sortableFields.push(...sortableFieldsRef.current);
          }
          if (fieldsRef.current) {
            fieldsRef.current.forEach(
              ({
                id,
                label,
                type = 'string',
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
                    type: mapTableColumnTypeToPrimitiveDataType(type),
                    getSortValue: getSortValue || (getFilterValue as any),
                    sortLabels,
                  });
                }
              }
            );
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
          const filterFields: typeof filterFieldsRef.current = [];
          if (filterFieldsRef.current) {
            filterFields.push(...filterFieldsRef.current);
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
                  .map(
                    ({
                      id,
                      label,
                      type = 'string',
                      getFilterValue,
                      getColumnValue,
                      getFieldOptionLabel,
                      options,
                      sortOptions,
                    }) => {
                      return {
                        id,
                        label: String(label),
                        type: mapTableColumnTypeToPrimitiveDataType(
                          type
                        ) as any,
                        getFieldOptionLabel:
                          getFieldOptionLabel ||
                          (ENUM_TABLE_COLUMN_TYPES.includes(type) &&
                          getColumnValue
                            ? getColumnValue
                            : undefined),
                        getFilterValue:
                          getFilterValue || (getColumnValue as any),
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

      //#region Resolving filter fields
      const searchableFields = (() => {
        const searchableFields: typeof searchableFieldsRef.current = [];
        if (searchableFieldsRef.current) {
          searchableFields.push(...searchableFieldsRef.current);
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
        if (viewsRef.current) {
          const listView = viewsRef.current.find(
            ({ type }) => type === 'List'
          ) as ListView<RecordRow> | null;
          if (listView) {
            searchableFields.push(
              ...listView.columns
                .filter(({ id, label }) => {
                  return (
                    typeof label === 'string' &&
                    !searchableFields.find(
                      ({ id: filterFieldId }) => filterFieldId === id
                    )
                  );
                })
                .map(({ id, label, getFilterValue, getColumnValue }) => {
                  return {
                    id,
                    label: label as string,
                    getFilterValue: getFilterValue || (getColumnValue as any),
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
    }, []);
  //#endregion

  const baseSelectedColumnIds = useMemo(() => {
    if (viewsRef.current) {
      const listView = viewsRef.current.find(
        ({ type }) => type === 'List'
      ) as ListView<RecordRow> | null;
      if (listView) {
        const { selectedColumnIds } = {
          ...listView,
          ...ListViewPropsRef.current,
        };
        if (selectedColumnIds) {
          return selectedColumnIds;
        }
        return listView.columns.map(({ id }) => String(id) as any);
      }
    }
  }, []);

  const { searchParams, setSearchParams, addSearchParamsToPath } =
    useReactRouterDOMSearchParams({
      mode: 'json',
      spec: {
        ...timelineSearchParamValidationSpec,
        view: Yup.string(),
        groupBy: Yup.array().of(
          Yup.object({
            id: Yup.mixed<keyof RecordRow>().required(),
            sortDirection: Yup.mixed<SortDirection>()
              .required()
              .oneOf([...sortDirections]),
          })
        ),
        expandedGroups: Yup.mixed<'All' | 'None' | string[]>(),
        expandedGroupsInverted: Yup.boolean(),
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
                operator: Yup.mixed<FilterOperator>().oneOf([
                  ...filterOperators,
                ]),
                value: Yup.mixed<string | number | (string | number)[]>(),
              })
            )
            .required(),
        }).default(undefined),
        search: Yup.string(),
        selectedColumns: Yup.array().of(Yup.string().required()),
        modifiedKeys: Yup.array().of(Yup.string().required()),
        createNewRecord: Yup.boolean(),
        selectedRecord: Yup.string(),
        editRecord: Yup.boolean(),
        selectedDataPreset: Yup.mixed<string | number>(),
      },
      id,
      paramStorage: stateStorage,
      clearSearchStateOnUnmount,
    });

  const {
    view: searchParamView,
    groupBy: searchParamGroupBy,
    sortBy: searchParamSortBy,
    search: searchParamSearchTerm,
    filterBy: searchParamFilterBy,
    selectedColumns: searchParamSelectedColumns,
    expandedGroups: searchParamExpandedGroups,
    expandedGroupsInverted: searchParamExpandedGroupsInverted,
    modifiedKeys: modifiedStateKeys,
    createNewRecord: searchParamCreateNewRecord,
    selectedRecord: selectedRecordId,
    editRecord,
    selectedDataPreset: searchParamSelectedDataPreset,
  } = searchParams;

  const unTrackableSearchParams = [
    'modifiedKeys',
    'createNewRecord',
    'selectedRecord',
    'editRecord',
  ];

  const getHashedSearchParamKey = (key: string) => {
    return hashIt(key).toString(36).slice(0, 3);
  };

  const updateChangedSearchParamKeys = () => {
    const changedSearchParamKeys = [
      ...new Set([
        ...(modifiedStateKeys || []),
        ...Object.keys(searchParams)
          .filter((key) => {
            return !unTrackableSearchParams.includes(key);
          })
          .map((key) => {
            return getHashedSearchParamKey(key);
          }),
      ]),
    ];
    if (
      JSON.stringify(changedSearchParamKeys) !==
      JSON.stringify(modifiedStateKeys)
    ) {
      setSearchParams(
        {
          modifiedKeys:
            changedSearchParamKeys.length > 0 ? changedSearchParamKeys : null,
        },
        {
          replace: true,
        }
      );
    }
  };
  const updateChangedSearchParamKeysRef = useRef(updateChangedSearchParamKeys);
  updateChangedSearchParamKeysRef.current = updateChangedSearchParamKeys;

  const stringifiedSearchParams = JSON.stringify(
    Object.keys(searchParams).filter((key) => {
      return !unTrackableSearchParams.includes(key);
    })
  );
  useEffect(() => {
    if (stringifiedSearchParams) {
      updateChangedSearchParamKeysRef.current();
    }
  }, [stringifiedSearchParams]);

  const createNewRecord = Boolean(
    searchParamCreateNewRecord || (pathToAddNew && pathname === pathToAddNew)
  );

  const selectedViewType = (() => {
    if (searchParamView) {
      return searchParamView as View;
    }
    if (
      viewProp &&
      !modifiedStateKeys?.includes(getHashedSearchParamKey('view'))
    ) {
      return viewProp;
    }
    return 'List' as View;
  })();

  const selectedGroupParams = useMemo(() => {
    const groupByParams = groupableFields.reduce(
      (accumulator, groupByParam) => {
        accumulator[groupByParam.id] = groupByParam;
        return accumulator;
      },
      {} as Record<keyof RecordRow, (typeof groupableFields)[number]>
    );

    return (() => {
      if (
        groupByProp &&
        (!searchParamGroupBy || searchParamGroupBy.length <= 0)
      ) {
        return groupByProp;
      }
      return searchParamGroupBy || [];
    })()
      .filter(({ id }) => {
        return result(groupByParams, id);
      })
      .map((groupByParam) => {
        return {
          ...groupByParam,
          ...(result(groupByParams, groupByParam.id) as any),
        };
      })
      .map((groupByParam) => {
        return {
          ...groupByParam,
          sortDirection: groupByParam.sortDirection || 'ASC',
        };
      });
  }, [groupByProp, groupableFields, searchParamGroupBy]);

  const selectedSortParams = useMemo(() => {
    const sortByParams = sortableFields.reduce((accumulator, sortByParam) => {
      accumulator[sortByParam.id] = sortByParam;
      return accumulator;
    }, {} as Record<keyof RecordRow, (typeof sortableFields)[number]>);

    return (() => {
      if (
        sortByPropRef.current &&
        !modifiedStateKeys?.includes(getHashedSearchParamKey('sortBy')) &&
        (!searchParamSortBy || searchParamSortBy.length <= 0)
      ) {
        return sortByPropRef.current;
      }
      return searchParamSortBy || [];
    })()
      .filter(({ id }) => {
        return result(sortByParams, id);
      })
      .map((sortByParam) => {
        return {
          ...sortByParam,
          ...(result(sortByParams, sortByParam.id) as any),
        };
      })
      .map((sortByParams) => {
        return {
          ...sortByParams,
          sortDirection: sortByParams.sortDirection || 'ASC',
        };
      });
  }, [modifiedStateKeys, searchParamSortBy, sortableFields]);

  const selectedConditionGroup = useMemo(() => {
    if (searchParamFilterBy) {
      return {
        ...searchParamFilterBy,
        conjunction: searchParamFilterBy.conjunction || 'and',
      } as ConditionGroup<RecordRow>;
    }
    if (
      filterByPropRef.current &&
      !modifiedStateKeys?.includes(getHashedSearchParamKey('filterBy'))
    ) {
      return {
        ...filterByPropRef.current,
        conjunction: filterByPropRef.current.conjunction || 'and',
      };
    }
  }, [modifiedStateKeys, searchParamFilterBy]);

  const selectedDataPresetIndex = (() => {
    if (dataPresets && dataPresets.length > 0) {
      if (searchParamSelectedDataPreset != null) {
        if (
          typeof searchParamSelectedDataPreset === 'number' &&
          dataPresets[searchParamSelectedDataPreset]
        ) {
          return searchParamSelectedDataPreset;
        }
        if (typeof searchParamSelectedDataPreset === 'string') {
          const presetIndex = dataPresets.findIndex(({ key, title }) => {
            return (
              (key && key === searchParamSelectedDataPreset) ||
              (typeof title === 'string' &&
                title === searchParamSelectedDataPreset)
            );
          });
          if (presetIndex >= 0) {
            return presetIndex;
          }
        }
      }
      if (selectedDataPresetIdProp) {
        if (
          typeof selectedDataPresetIdProp === 'number' &&
          dataPresets[selectedDataPresetIdProp]
        ) {
          return selectedDataPresetIdProp;
        }
        const presetIndex = dataPresets.findIndex(({ key, title }) => {
          return (
            key === selectedDataPresetIdProp ||
            title === selectedDataPresetIdProp
          );
        });
        if (presetIndex >= 0) {
          return presetIndex;
        }
      }
      return 0;
    }
  })();

  const selectedDataPreset = (() => {
    if (
      selectedDataPresetIndex != null &&
      dataPresets &&
      dataPresets.length > 0
    ) {
      return dataPresets[selectedDataPresetIndex];
    }
  })();

  const selectedColumnIds =
    searchParamSelectedColumns || baseSelectedColumnIds || [];

  const searchTerm = (() => {
    if (searchParamSearchTerm) {
      return searchParamSearchTerm;
    }
    if (
      searchTermProp &&
      !modifiedStateKeys?.includes(getHashedSearchParamKey('search'))
    ) {
      return searchTermProp;
    }
  })();

  const { loggedInUserHasPermission } = useAuth();

  const {
    allPageRecords: asyncData,
    load,
    loading,
    errorMessage,
  } = usePaginatedRecords(
    async ({
      limit,
      offset,
      getRequestController,
      getStaleWhileRevalidate,
    }) => {
      const selectedRecordsFinder = (() => {
        if (recordsFinder) {
          return recordsFinder;
        }

        if (selectedDataPreset) {
          return selectedDataPreset.recordsFinder;
        }
      })();

      if (selectedRecordsFinder) {
        return selectedRecordsFinder({
          searchTerm,
          limit,
          offset,
          getRequestController,
          getStaleWhileRevalidate,
        });
      }
      return [];
    },
    {
      revalidationKey,
      loadOnMount: showRecords,
      refreshInterval,
      ...PaginatedRecordsOptions,
    }
  );

  useEffect(() => {
    if (
      !isInitialMountRef.current &&
      dataPresetsRef.current &&
      dataPresetsRef.current.length > 0 &&
      selectedDataPresetIndex != null
    ) {
      load();
    }
  }, [load, selectedDataPresetIndex]);

  useEffect(() => {
    getRecordLoadFunctionRef.current?.(load);
  }, [load]);

  const data = (() => {
    if ((recordsFinder || dataPresets) && asyncData.length > 0) {
      return asyncData;
    }
    return dataProp || [];
  })();

  //#region Filtering data
  const filteredData = useMemo(() => {
    // Filtering data
    const dataFilteredByFilterFields = (() => {
      if (filterFields) {
        if (
          selectedConditionGroup &&
          selectedConditionGroup.conditions.length > 0
        ) {
          const emptyfilterOperators: FilterOperator[] = [
            'is empty',
            'is not empty',
          ];
          return data.filter((row) => {
            return selectedConditionGroup.conditions
              .filter(({ operator, value }) => {
                return (
                  operator &&
                  (emptyfilterOperators.includes(operator) ||
                    (value != null && String(value).length > 0))
                );
              })
              [selectedConditionGroup.conjunction === 'and' ? 'every' : 'some'](
                ({ operator, value, fieldId }) => {
                  const { rawFieldValue, formattedFieldValue }: any = (() => {
                    const rawFieldValue = result(row, fieldId);
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
          const lowercaseSearchTerm = searchTerm.toLowerCase();
          return dataFilteredByFilterFields.filter((row) => {
            return searchableFields.some(({ id, getFilterValue }) => {
              const searchValues: string[] = [];
              if (typeof result(row, id) === 'string') {
                searchValues.push(result(row, id) as any);
              }
              if (getFilterValue) {
                const filterValue = getFilterValue(row);
                if (typeof filterValue === 'string') {
                  searchValues.push(filterValue);
                }
              }
              return (
                searchValues.length > 0 &&
                searchValues.some((value) => {
                  return value.toLowerCase().match(lowercaseSearchTerm);
                })
              );
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
  }, [
    data,
    filterFields,
    searchTerm,
    searchableFields,
    selectedConditionGroup,
    selectedSortParams,
  ]);
  //#endregion

  // Grouping data
  const groupedData = useMemo(() => {
    if (selectedGroupParams.length > 0) {
      const groupParams = [...selectedGroupParams];

      const groupData = (
        inputGroupableData: typeof filteredData,
        nestIndex = 0
      ): NestedDataGroup<RecordRow>[] | DataGroup<RecordRow>[] => {
        const currentGroupParams = groupParams[nestIndex];
        const { id, getSortValue, getGroupLabel } = currentGroupParams;
        const groupableData = getGroupableDataRef.current
          ? getGroupableDataRef.current(inputGroupableData, currentGroupParams)
          : inputGroupableData;

        const groupedData = groupableData
          .reduce((accumulator, row: any) => {
            const fieldValue = (() => {
              if (getSortValue) {
                return getSortValue(row);
              }
              return result(row, id);
            })();
            let existingGroup = accumulator.find(({ groupName }) => {
              return (
                (fieldValue == null && groupName === '') ||
                (fieldValue != null && groupName === String(fieldValue))
              );
            })!;
            if (!existingGroup) {
              existingGroup = {
                ...row,
                groupName: fieldValue != null ? String(fieldValue) : '',
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
              childrenCount: group.children.length,
            };
          })
          .sort((a, b) => {
            return sort(a, b, [currentGroupParams as any]);
          });

        if (nestIndex < groupParams.length - 1) {
          return groupedData.map(({ children, ...restDataGroup }) => {
            return {
              ...restDataGroup,
              children: groupData(children, nestIndex + 1),
            } as NestedDataGroup<RecordRow>;
          });
        }

        return groupedData;
      };
      return groupData(filteredData);
    }
    return null;
  }, [filteredData, selectedGroupParams]);

  const pathToAddNewRecord = (() => {
    if (pathToAddNew) {
      return pathToAddNew;
    }
    if (recordCreator) {
      return addSearchParamsToPath(pathname, {
        createNewRecord: true,
      });
    }
  })();

  const resetToDefaultView = () => {
    setSearchParams(
      {
        view: null,
        sortBy: null,
        groupBy: null,
        search: null,
        selectedColumns: null,
        expandedGroups: null,
        expandedGroupsInverted: null,
        filterBy: null,
        selectedDataPreset: null,
        modifiedKeys: null,
      },
      {
        replace: true,
      }
    );
    if (
      selectedViewType === 'Timeline' &&
      resetTimelineToDefaultViewRef.current
    ) {
      resetTimelineToDefaultViewRef.current();
    }
  };

  const {
    create,
    creating,
    created,
    createdRecord,
    errorMessage: createErrorMessage,
    reset: resetCreation,
  } = useCreate(recordCreator!);

  const {
    load: loadRecordDetails,
    loading: loadingRecordDetails,
    errorMessage: loadingRecordDetailsErrorMessage,
    record: loadedSelectedRecord,
    reset: resetSelectedRecordState,
  } = useRecord(
    async () => {
      if (recordDetailsFinder) {
        if (selectedRecordId) {
          return recordDetailsFinder(selectedRecordId);
        }
      }
    },
    {
      loadOnMount: false,
    }
  );

  useEffect(() => {
    getRecordDetailsLoadFunctionRef.current?.(loadRecordDetails);
  }, [loadRecordDetails]);

  const selectedRecord = (() => {
    if (loadedSelectedRecord) {
      return loadedSelectedRecord;
    }
    if (data.length > 0 && selectedRecordId) {
      return data.find(({ id }) => {
        return id === selectedRecordId;
      });
    }
  })();

  const {
    update,
    updating,
    updated,
    errorMessage: updateErrorMessage,
    reset: resetUpdate,
  } = useUpdate(recordEditor!);

  const editInitialValues = useMemo(() => {
    if (getEditableRecordInitialValuesRef.current && selectedRecord) {
      return getEditableRecordInitialValuesRef.current(selectedRecord);
    }
    return { ...initialValues, ...(selectedRecord as any) };
  }, [selectedRecord, initialValues]);

  const allGroupsExpanded = Boolean(
    !searchParamExpandedGroups || searchParamExpandedGroups === 'All'
  );
  const expandedGroups = (() => {
    if (Array.isArray(searchParamExpandedGroups)) {
      return searchParamExpandedGroups;
    }
    return [];
  })();
  const expandedGroupsInverted = Boolean(searchParamExpandedGroupsInverted);

  const editFunctionRef = useRef((record: RecordRow) => {
    resetSelectedRecordState();
    if (pathToEdit || getPathToEdit) {
      navigate(
        (() => {
          if (pathToEdit) {
            return pathToEdit;
          }
          if (getPathToEdit) {
            return getPathToEdit(record);
          }
          return pathname;
        })()
      );
    } else {
      setSearchParams({
        selectedRecord: record.id,
        editRecord: true,
      });
    }
  });

  const deleteFunctionRef = useRef((record: RecordRow) => {
    console.log({ record });
    // TODO: Implement Delete function
  });

  const isEditable = Boolean(recordEditor || pathToEdit || getPathToEdit);
  const isDeletable = Boolean(recordDeletor);

  const { showSuccessMessage } = useMessagingContext();

  //#region Timeline view tools
  const currentDateAtCenterRef = useRef<Date | null>(null);
  const selectTimeScaleRef = useRef<SelectTimeScaleCallbackFunction>();
  const scrollToDateRef = useRef<ScrollToDateFunction>();
  const jumpToOptimalTimeScaleRef = useRef<() => void>();
  const jumpToPreviousUnitTimeScaleRef = useRef<() => void>();
  const jumpToNextUnitTimeScaleRef = useRef<() => void>();

  const timelineView = views?.find(({ type }) => type === 'Timeline') as
    | TimelineView<RecordRow>
    | undefined;

  const [selectedTimeScale, setSelectedTimeScale] =
    useState<TimeScaleOption>('Year');
  const [timelineDateBounds, setTimelineDateBounds] = useState<
    | {
        minDate: Date;
        maxDate: Date;
      }
    | undefined
  >();
  const [showJumpToOptimalTimeScaleTool, setShowJumpToOptimalTimeScaleTool] =
    useState(false);

  const timeScaleTool = useTimeScaleTool({
    ...timelineView?.TimeScaleToolProps,
    ...TimelineViewProps?.TimeScaleToolProps,
    selectedTimeScale,
    onSelectTimeScale: selectTimeScaleRef.current,
    supportedTimeScales:
      timelineView?.supportedTimeScales ||
      TimelineViewProps?.supportedTimeScales,
  });
  const scrollTimelineTools = useScrollTimelineTools({
    scrollToDate: scrollToDateRef.current,
    jumpToOptimalTimeScale: jumpToOptimalTimeScaleRef.current,
    jumpToPreviousUnitTimeScale: jumpToPreviousUnitTimeScaleRef.current,
    jumpToNextUnitTimeScale: jumpToNextUnitTimeScaleRef.current,
    JumpToDateToolProps: {
      minDate: timelineDateBounds?.minDate,
      maxDate: timelineDateBounds?.maxDate,
      selectedDate: currentDateAtCenterRef.current,
    },
    showJumpToOptimalTimeScaleTool,
  });
  //#endregion

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const viewElement = (() => {
    if (views) {
      const selectedView = views.find(({ type }) => type === selectedViewType);
      if (selectedView) {
        const { type } = selectedView;
        switch (type) {
          case 'List':
            const { ...viewProps } = omit(
              selectedView,
              'type',
              'minWidth',
              'mergeTools'
            ) as ListView<RecordRow>;
            const {
              enableColumnDisplayToggle = true,
              enableSmallScreenOptimization = enableSmallScreenOptimizationProp,
              enableCheckboxAllRowSelector = enableCheckboxAllRowSelectorProp,
              enableCheckboxRowSelectors = enableCheckboxRowSelectorsProp,
              showRowNumber = showRowNumberProp,
              getEllipsisMenuToolProps,
              onClickRow,
            } = { ...selectedView, ...ListViewProps };
            const displayingColumns = selectedView.columns.filter(({ id }) => {
              return selectedColumnIds.includes(String(id) as any);
            });

            return (
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                {(() => {
                  const { columns, sx } = viewProps;
                  const baseTableColumns = columns.map((column) => ({
                    ...column,
                  }));

                  const tableData = (() => {
                    if (groupedData) {
                      const groupRows: RecordRow[] = [];
                      const allGroupIds: string[] = [];

                      interface FlattenGroupHierachyOptions {
                        indentLevel?: number;
                        parentGroupId?: string;
                        generateGroupHeaderRow?: boolean;
                        parentGroupCollapsed?: boolean;
                      }
                      const flattenGroupHierachy = (
                        inputGroupedData: typeof groupedData,
                        {
                          indentLevel = 0,
                          parentGroupId,
                          generateGroupHeaderRow = true,
                          parentGroupCollapsed = false,
                        }: FlattenGroupHierachyOptions = {}
                      ) => {
                        inputGroupedData.forEach(
                          ({ id, label, children, childrenCount, ...rest }) => {
                            const groupId = `group:${indentLevel}${id}${
                              parentGroupId || ''
                            }`;
                            const groupCollapsed =
                              parentGroupCollapsed ||
                              (() => {
                                if (expandedGroupsInverted) {
                                  return expandedGroups.includes(groupId);
                                }
                                return (
                                  !expandedGroups.includes(groupId) &&
                                  !allGroupsExpanded
                                );
                              })();
                            allGroupIds.push(groupId);
                            if (generateGroupHeaderRow) {
                              groupRows.push({
                                id: groupId,
                                ...rest,
                                GroupingProps: {
                                  isGroupHeader: true,
                                  groupId,
                                  groupLabel: label,
                                  groupCollapsed,
                                  indentLevel,
                                  parentGroupId,
                                  childrenCount,
                                  onChangeGroupCollapsed: (collapsed) => {
                                    const allExpandedGroups = (() => {
                                      if (expandedGroupsInverted) {
                                        return allGroupIds.filter((groupId) => {
                                          return !expandedGroups.includes(
                                            groupId
                                          );
                                        });
                                      }
                                      return allGroupsExpanded
                                        ? [...allGroupIds]
                                        : [...expandedGroups];
                                    })();
                                    if (collapsed) {
                                      allExpandedGroups.includes(groupId) &&
                                        allExpandedGroups.splice(
                                          allExpandedGroups.indexOf(groupId),
                                          1
                                        );
                                    } else {
                                      allExpandedGroups.includes(groupId) ||
                                        allExpandedGroups.push(groupId);
                                    }
                                    const allCollapsedGroups =
                                      allGroupIds.filter((groupId) => {
                                        return !allExpandedGroups.includes(
                                          groupId
                                        );
                                      });
                                    const nextExpandedGroupsInverted =
                                      allCollapsedGroups.length <
                                      allExpandedGroups.length;
                                    setSearchParams(
                                      {
                                        expandedGroups: (() => {
                                          if (allExpandedGroups.length > 0) {
                                            if (
                                              groupedData.length ===
                                              allExpandedGroups.length
                                            ) {
                                              return 'All';
                                            }
                                            if (
                                              allExpandedGroups.includes('None')
                                            ) {
                                              allExpandedGroups.splice(
                                                allExpandedGroups.indexOf(
                                                  'None'
                                                ),
                                                1
                                              );
                                            }
                                            if (nextExpandedGroupsInverted) {
                                              return allCollapsedGroups;
                                            }
                                            return allExpandedGroups;
                                          } else {
                                            return 'None';
                                          }
                                        })(),
                                        expandedGroupsInverted:
                                          nextExpandedGroupsInverted,
                                      },
                                      {
                                        replace: true,
                                      }
                                    );
                                  },
                                },
                              } as RecordRow);
                            }

                            const { children: nestedChildren, groupName } =
                              (children[0] as NestedDataGroup<RecordRow>) || {};
                            if (!groupCollapsed) {
                              if (nestedChildren && groupName) {
                                return flattenGroupHierachy(
                                  children as NestedDataGroup<RecordRow>[],
                                  {
                                    indentLevel: indentLevel + 1,
                                    parentGroupId: groupId,
                                    parentGroupCollapsed: groupCollapsed,
                                  }
                                );
                              } else {
                                (children as RecordRow[]).forEach(
                                  ({ ...rest }) => {
                                    groupRows.push({
                                      ...rest,
                                      GroupingProps: {
                                        parentGroupId: groupId,
                                        parentGroupIndentLevel: indentLevel,
                                        groupCollapsed,
                                      },
                                    } as RecordRow);
                                  }
                                );
                              }
                            } else {
                              if (nestedChildren && groupName) {
                                return flattenGroupHierachy(
                                  children as NestedDataGroup<RecordRow>[],
                                  {
                                    indentLevel: indentLevel + 1,
                                    parentGroupId: groupId,
                                    parentGroupCollapsed: groupCollapsed,
                                    generateGroupHeaderRow: false,
                                  }
                                );
                              }
                            }
                          }
                        );
                      };
                      flattenGroupHierachy(groupedData);

                      const firstDisplayingColumn = baseTableColumns.find(
                        ({ id }) => {
                          return id === displayingColumns[0].id;
                        }
                      );
                      if (firstDisplayingColumn) {
                        delete firstDisplayingColumn.width;
                      }

                      return groupRows;
                    }
                    return filteredData;
                  })();

                  const baseTableProps: typeof viewProps = {
                    startStickyColumnIndex: 0,
                    ...viewProps,
                    ...ListViewProps,
                    paging: false,
                    enableColumnDisplayToggle,
                    enableCheckboxAllRowSelector,
                    enableCheckboxRowSelectors,
                    enableSmallScreenOptimization,
                    showRowNumber,
                    bordersVariant: 'square',
                    selectedColumnIds,
                    ...(() => {
                      if (isEditable || isDeletable || getRecordTools) {
                        return {
                          getEllipsisMenuToolProps: (row) => {
                            const ellipsisMenuToolProps = (() => {
                              if (getEllipsisMenuToolProps) {
                                return getEllipsisMenuToolProps(row);
                              }
                            })();
                            const options =
                              ellipsisMenuToolProps?.options || [];

                            return {
                              ...ellipsisMenuToolProps,
                              options: [
                                ...(() => {
                                  if (isEditable) {
                                    return [
                                      {
                                        label: 'Edit',
                                        value: 'Edit',
                                        icon: <EditIcon />,
                                        onClick: () => {
                                          editFunctionRef.current(row);
                                        },
                                      },
                                    ];
                                  }
                                  return [];
                                })(),
                                ...(() => {
                                  if (isDeletable) {
                                    return [
                                      {
                                        label: 'Delete',
                                        value: 'Delete',
                                        icon: <DeleteOutlineIcon />,
                                        onClick: () => {
                                          deleteFunctionRef.current(row);
                                        },
                                      },
                                    ];
                                  }
                                  return [];
                                })(),
                                ...options,
                                ...(() => {
                                  if (getRecordTools) {
                                    return getRecordTools(row);
                                  }
                                  return [];
                                })(),
                              ],
                            };
                          },
                        };
                      }
                      return {
                        getEllipsisMenuToolProps,
                      };
                    })(),
                    onClickRow:
                      onClickRow ??
                      (() => {
                        if (editorForm || getPathToView) {
                          return viewFunctionRef.current;
                        }
                      })(),
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
                          },
                          {
                            replace: true,
                          }
                        );
                      }
                    },
                  };

                  return (
                    <Table
                      {...baseTableProps}
                      {...tableControlProps}
                      columns={baseTableColumns}
                      rows={tableData}
                      {...(() => {
                        if (groupedData) {
                          return {
                            isGroupedTable: true,
                            TableGroupingProps: {
                              allGroupsCollapsed: !allGroupsExpanded,
                              onChangeAllGroupsCollapsed: (
                                allGroupsExpanded
                              ) => {
                                setSearchParams(
                                  {
                                    expandedGroups: allGroupsExpanded
                                      ? 'None'
                                      : 'All',
                                    expandedGroupsInverted: null,
                                  },
                                  {
                                    replace: true,
                                  }
                                );
                              },
                            },
                          };
                        }
                      })()}
                      scrollableElement={bodyElementRef.current}
                      stickyHeader
                      sx={{
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
            const { mergeTools, ...viewProps } = omit(
              { ...selectedView, ...TimelineViewProps },
              'type'
            ) as TimelineView<RecordRow>;
            if (!viewProps.getRowLabel && !viewProps.rowLabelProperty) {
              const listView = views.find(
                ({ type }) => type === 'List'
              ) as ListView<RecordRow> | null;
              if (listView && listView.columns.length > 0) {
                viewProps.rowLabelProperty = listView.columns[0].id;
                viewProps.getRowLabel = listView.columns[0]
                  .getColumnValue as any;
              }
            }
            return (
              <Timeline
                {...viewProps}
                {...{ id, clearSearchStateOnUnmount }}
                rows={filteredData}
                getDefaultViewResetFunction={(resetTimelineToDefaultView) => {
                  resetTimelineToDefaultViewRef.current =
                    resetTimelineToDefaultView;
                }}
                onChangeSelectedTimeScale={(selectedTimeScale) => {
                  setSelectedTimeScale(selectedTimeScale);
                }}
                onChangeTimelineDateBounds={(dateBounds) => {
                  setTimelineDateBounds(dateBounds);
                }}
                onChangeCurrentDateAtCenter={(currentDateAtCenter) => {
                  currentDateAtCenterRef.current = currentDateAtCenter;
                }}
                onChangeShowJumpToOptimalTimeScaleTool={(
                  showJumpToOptimalTimeScaleTool
                ) => {
                  setShowJumpToOptimalTimeScaleTool(
                    showJumpToOptimalTimeScaleTool
                  );
                }}
                getScrollToDateFunction={(scrollToDate) => {
                  scrollToDateRef.current = scrollToDate;
                }}
                getSelectTimeScaleFunction={(selectTimeScale) => {
                  selectTimeScaleRef.current = selectTimeScale;
                }}
                getJumpToOptimalTimeScaleFunction={(jumpToOptimalTimeScale) => {
                  jumpToOptimalTimeScaleRef.current = jumpToOptimalTimeScale;
                }}
                getJumpToPreviousUnitTimeScaleFunction={(
                  jumpToPreviousUnitTimeScale
                ) => {
                  jumpToPreviousUnitTimeScaleRef.current =
                    jumpToPreviousUnitTimeScale;
                }}
                getJumpToNextUnitTimeScaleFunction={(
                  jumpToNextUnitTimeScale
                ) => {
                  jumpToNextUnitTimeScaleRef.current = jumpToNextUnitTimeScale;
                }}
                showToolBar={!mergeTools}
              />
            );
          }
        }
      }
    }
  })() as ReactNode | undefined;

  const state: RecordsExplorerChildrenOptions<RecordRow> = {
    selectedView: selectedViewType,
    data: filteredData,
    headerHeight: headerElementRef.current?.offsetHeight,
    filterFields,
    filterBy: selectedConditionGroup,
    sortableFields,
    sortBy: selectedSortParams,
    groupableFields,
    groupBy: selectedGroupParams,
    loading,
    errorMessage,
    searchParamSelectedDataPreset,
    selectedDataPreset,
  };

  const title = (() => {
    if (!recordsFinder && dataPresets && dataPresets.length > 0) {
      return (
        <DataDropdownField
          variant="text"
          value={String(selectedDataPresetIndex)}
          options={dataPresets.map((dataPreset, index) => {
            const { title } = dataPreset;
            return {
              label: title,
              value: String(index),
              entity: dataPreset,
            };
          })}
          onChange={(event) => {
            const { value } = event.target;
            setSearchParams(
              {
                selectedDataPreset: (() => {
                  if (value) {
                    const numericValue = +value;
                    if (dataPresets[numericValue]) {
                      if (dataPresets[numericValue].key) {
                        return dataPresets[numericValue].key;
                      }
                      if (typeof dataPresets[numericValue].title === 'string') {
                        return String(dataPresets[numericValue].title);
                      }
                      return numericValue;
                    }
                  }
                  return null;
                })(),
              },
              {
                replace: true,
              }
            );
          }}
          showClearButton={false}
          searchable={dataPresets.length > 10}
        />
      );
    }
    if (titleProp) {
      return titleProp;
    }
    if (getTitle) {
      return getTitle(state);
    }
  })();

  const isSearchable = Boolean(isSearchableProp && searchableFields);

  //#region Tools
  const viewOptionsTool = useViewOptionsTool({
    viewOptionTypes: (() => {
      if (views) {
        return views.map(({ type }) => type);
      }
    })(),
    ...ViewOptionsToolProps,
    viewType: selectedViewType,
    onChangeViewType: (view) => {
      setSearchParams(
        {
          view: view !== viewProp ? view : null,
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
          groupBy:
            groupParams.length > 0
              ? groupParams.map(({ id, sortDirection }) => {
                  return {
                    id,
                    sortDirection,
                  };
                })
              : null,
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
          sortBy:
            sortParams.length > 0
              ? sortParams.map(({ id, sortDirection }) => {
                  return {
                    id,
                    sortDirection,
                  };
                })
              : null,
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
        },
        { replace: true }
      );
    },
  });

  const toolsLookup: RecordsExplorerTools = {};

  if (showViewOptionsTool && (ViewOptionsToolProps || views)) {
    toolsLookup['VIEW_OPTIONS'] = viewOptionsTool;
  }

  if (
    (() => {
      if (typeof showGroupTool === 'function') {
        return showGroupTool(state);
      }
      return showGroupTool;
    })() &&
    groupableFields.length > 0
  ) {
    toolsLookup['GROUP'] = groupTool;
  }

  if (showSortTool && sortableFields.length > 0) {
    toolsLookup['SORT'] = sortTool;
  }

  if (showFilterTool && filterFields.length > 0) {
    toolsLookup['FILTER'] = filterTool;
  }

  if (
    pathToAddNewRecord &&
    (!hideAddNewButtonOnNoFilteredData || filteredData.length > 0) &&
    (!permissionToAddNew || loggedInUserHasPermission(permissionToAddNew))
  ) {
    if (isSmallScreenSize) {
      if (!fillContentArea) {
        toolsLookup['ADD_NEW'] = {
          icon: <AddIcon />,
          type: 'icon-button',
          label: addNewButtonLabel,
          alwaysShowOn: 'All Screens',
          ...(() => {
            return {
              component: RouterLink,
              to: pathToAddNewRecord,
            };
          })(),
          sx: {
            '&,&:hover': {
              bgcolor: palette.primary.main,
              color: palette.getContrastText(palette.primary.main),
            },
          },
        };
      }
    } else {
      toolsLookup['ADD_NEW'] = {
        icon: <AddIcon />,
        type: 'button',
        label: addNewButtonLabel,
        size: 'small',
        variant: 'contained',
        ...(() => {
          return {
            component: RouterLink,
            to: pathToAddNewRecord,
          };
        })(),
      };
    }
  }

  if (modifiedStateKeys && modifiedStateKeys.length > 0) {
    toolsLookup['RESET_TO_DEFAULT_VIEW'] = {
      label: 'Reset to default view',
      icon: <LockResetIcon />,
      onClick: () => {
        resetToDefaultView();
      },
      type: 'icon-button',
      alwaysShowOn: 'All Screens',
    };
  }

  if (
    selectedViewType === 'Timeline' &&
    (timelineView?.mergeTools || TimelineViewProps?.mergeTools)
  ) {
    toolsLookup['TIMELINE_TIME_SCALE'] = timeScaleTool;
    toolsLookup['TIMELINE_SCROLL'] = scrollTimelineTools;
  }

  const tools = (() => {
    if (preprocessTools) {
      return preprocessTools({ ...state, tools: toolsLookup });
    }

    const tools: (ReactNode | Tool)[] = [];
    if (toolsLookup['ADD_NEW']) {
      tools.push(toolsLookup['ADD_NEW']);
    }
    if (toolsLookup['VIEW_OPTIONS']) {
      tools.push(toolsLookup['VIEW_OPTIONS']);
    }
    if (toolsLookup['GROUP']) {
      tools.push(toolsLookup['GROUP']);
    }
    if (toolsLookup['SORT']) {
      tools.push(toolsLookup['SORT']);
    }
    if (toolsLookup['FILTER']) {
      tools.push(toolsLookup['FILTER']);
    }
    if (toolsLookup['TIMELINE_TIME_SCALE'] || toolsLookup['TIMELINE_SCROLL']) {
      tools.push(
        {
          type: 'divider',
        },
        toolsLookup['TIMELINE_TIME_SCALE'],
        toolsLookup['TIMELINE_SCROLL']
      );
    }

    if (toolsProp) {
      tools.push(
        {
          type: 'divider',
        },
        ...toolsProp
      );
    }

    if (modifiedStateKeys && modifiedStateKeys.length > 0) {
      tools.push(
        {
          type: 'divider',
        },
        {
          label: 'Reset to default view',
          icon: <LockResetIcon />,
          onClick: () => {
            resetToDefaultView();
          },
          type: 'icon-button',
          alwaysShowOn: 'All Screens',
        }
      );
    }
    return tools;
  })();
  //#endregion

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
        })(),
      }}
    >
      <Paper
        elevation={0}
        {...HeaderPropsRest}
        ref={headerElementRef}
        className={clsx(classes.header, HeaderPropsRest.className)}
        component="header"
        sx={{ position: 'sticky', top: 0, zIndex: 100, ...HeaderPropsSx }}
      >
        <SearchSyncToolbar
          searchFieldPlaceholder={`Filter ${lowercaseRecordLabelPlural}`}
          hasSearchTool={isSearchable}
          searchFieldOpen
          {...SearchSyncToolBarPropsRest}
          title={(() => {
            if (title) {
              if (getWrappedTitle) {
                return getWrappedTitle({
                  ...state,
                  title,
                });
              }
              return title;
            }
          })()}
          searchTerm={searchParamSearchTerm || controlledSearchTerm || ''}
          load={(() => {
            if (loadProp) {
              return loadProp;
            }
            if (recordsFinder || dataPresets) {
              return load;
            }
          })()}
          loading={loadingProp ?? loading}
          errorMessage={errorMessageProp ?? errorMessage}
          tools={tools}
          onChangeSearchTerm={(searchTerm: string) => {
            if (isSearchable) {
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
            }
            onChangeSearchTerm && onChangeSearchTerm(searchTerm);
          }}
        />
        <Divider />
      </Paper>
      <Box
        {...BodyPropsRest}
        ref={bodyElementRef}
        className={clsx(classes.section, BodyPropsRest.className)}
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
                  addNewButtonLabel,
                }}
                {...IconLoadingScreenProps}
                pathToAddNew={pathToAddNewRecord}
                load={loadProp ?? load}
                loading={loadingProp ?? loading}
                errorMessage={errorMessageProp ?? errorMessage}
                recordsCount={filteredData.length}
              />
            );
          }
          return (
            <>
              {(() => {
                if (viewElement) {
                  return viewElement;
                }
              })()}
              {(() => {
                if (typeof children === 'function') {
                  return children(state);
                }
                return children;
              })()}
            </>
          );
        })()}

        {/* Popups */}
        {(() => {
          if (
            (selectedRecordId || (validationSchema && initialValues)) &&
            editorForm
          ) {
            const hasFormProps = Boolean(validationSchema && initialValues);
            const modalFormProps: Partial<ModalFormProps> = {
              ...ModalFormPropsRest,
              FormikProps: {
                enableReinitialize: true,
              },
            };
            return (
              <>
                {/* Create Form */}
                {hasFormProps ? (
                  <ModalForm
                    lockSubmitIfNoChange={false}
                    title={
                      <Grid
                        container
                        sx={{
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Grid item>Add New {recordLabelSingular}</Grid>
                        {descriptionElement}
                      </Grid>
                    }
                    submitButtonText={`Add ${recordLabelSingular}`}
                    {...modalFormProps}
                    {...CreateModalFormPropsRest}
                    initialValues={initialValues || {}}
                    validationSchema={validationSchema || {}}
                    open={createNewRecord}
                    errorMessage={createErrorMessage}
                    loading={creating}
                    onSubmit={async (values) => {
                      if (recordCreator) {
                        await create(values);
                      }
                    }}
                    onClose={() => {
                      resetCreation();
                      if (created) {
                        if (showSuccessMessageOnCreateRecord) {
                          showSuccessMessage(
                            recordCreateSuccessMessage ||
                              `The new ${lowercaseRecordLabelSingular} was created successfully`
                          );
                        }
                        autoSync && setTimeout(() => load(), 1000);
                      }
                      onCreateNewRecord && onCreateNewRecord(createdRecord);
                      if (defaultPath) {
                        navigate(defaultPath);
                      } else {
                        setSearchParams({
                          createNewRecord: null,
                        });
                      }
                    }}
                    submitted={created}
                  >
                    {({ ...rest }) => {
                      if (typeof editorForm === 'function') {
                        return editorForm({
                          mode: 'create',
                          loadingState: {
                            loading: false,
                          },
                          ...rest,
                        });
                      }
                      return editorForm;
                    }}
                  </ModalForm>
                ) : null}

                {/* Edit Form */}
                {(() => {
                  const loadingState = {
                    loading: loadingRecordDetails || loadingProp || loading,
                    errorMessage: loadingRecordDetailsErrorMessage,
                    load: loadRecordDetails,
                    locked: !editRecord,
                  };
                  return (
                    <LoadingProvider value={loadingState}>
                      <ModalForm
                        showEditButton={Boolean(recordEditor)}
                        title={
                          <Grid
                            container
                            sx={{
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Grid item>
                              {(() => {
                                if (editRecord) {
                                  return `Edit ${recordLabelSingular}`;
                                }
                                if (getViewTitle && selectedRecord) {
                                  return getViewTitle(selectedRecord);
                                }
                                return recordLabelSingular;
                              })()}
                            </Grid>
                            {descriptionElement}
                          </Grid>
                        }
                        submitButtonText={`Update ${recordLabelSingular}`}
                        {...ViewModalFormPropsRest}
                        {...modalFormProps}
                        editableFields={editableFields}
                        validationSchema={
                          editValidationSchema || validationSchema
                        }
                        initialValues={editInitialValues || {}}
                        open={Boolean(selectedRecordId)}
                        errorMessage={updateErrorMessage}
                        loading={updating}
                        onSubmit={async (values) => {
                          if (recordEditor && selectedRecord) {
                            await update(selectedRecord, values);
                          }
                        }}
                        onClose={() => {
                          if (updated) {
                            onEditRecord && onEditRecord();
                            autoSync && load();
                            showSuccessMessage(
                              recordEditSuccessMessage ||
                                `The ${lowercaseRecordLabelSingular} was updated successfully`
                            );
                          }
                          resetUpdate();
                          resetSelectedRecordState();
                          if (defaultPath) {
                            navigate(defaultPath);
                          } else {
                            setSearchParams({
                              selectedRecord: null,
                              editRecord: null,
                            });
                          }
                        }}
                        submitted={updated}
                        editMode={Boolean(editRecord)}
                        SearchSyncToolbarProps={{
                          ...modalFormProps.SearchSyncToolbarProps,
                          load: loadRecordDetails,
                          loading: loadingRecordDetails,
                          errorMessage: loadingRecordDetailsErrorMessage,
                          hasSyncTool: Boolean(recordDetailsFinder),
                        }}
                        onClickEdit={() => {
                          const pathToEditRecord = (() => {
                            if (pathToEdit) {
                              return pathToEdit;
                            }
                            if (getPathToEdit && selectedRecord) {
                              return getPathToEdit(selectedRecord);
                            }
                            return addSearchParamsToPath(pathname, {
                              editRecord: true,
                            });
                          })();
                          navigate(pathToEditRecord);
                        }}
                        viewModeTools={[
                          ...(() => {
                            if (isDeletable && selectedRecord) {
                              return [
                                <Button
                                  key="delete"
                                  variant="contained"
                                  color="error"
                                  onClick={() => {
                                    deleteFunctionRef.current(selectedRecord);
                                  }}
                                >
                                  Delete
                                </Button>,
                              ];
                            }
                            return [];
                          })(),
                        ]}
                      >
                        {({ ...rest }) => {
                          if (typeof editorForm === 'function') {
                            return editorForm({
                              mode: editRecord ? 'edit' : 'view',
                              selectedRecord,
                              loadingState,
                              ...rest,
                            });
                          }
                          return editorForm;
                        }}
                      </ModalForm>
                    </LoadingProvider>
                  );
                })()}
              </>
            );
          }
        })()}
      </Box>
      {(() => {
        const shouldShowPaginationStats =
          !isSmallScreenSize &&
          (() => {
            if (typeof showPaginationStats === 'function') {
              return showPaginationStats(state);
            }
            return showPaginationStats;
          })() &&
          filteredData.length > 0;
        const bottomTools = (() => {
          if (getBottomTools) {
            return getBottomTools(state);
          }
          return bottomToolsProp;
        })();
        if (
          shouldShowPaginationStats ||
          (bottomTools && bottomTools.length > 0)
        ) {
          return (
            <Paper
              elevation={0}
              className={clsx(classes.footer)}
              component="footer"
              sx={{ position: 'sticky', bottom: 0, zIndex: 5 }}
            >
              <Divider />
              <SearchSyncToolbar
                title={
                  shouldShowPaginationStats ? (
                    <DataTablePagination
                      labelPlural={lowercaseRecordLabelPlural}
                      lowercaseLabelPlural={lowercaseRecordLabelPlural}
                      labelSingular={lowercaseRecordLabelSingular}
                      filteredCount={filteredData.length}
                      totalCount={data.length}
                      sx={{
                        p: 0,
                      }}
                    />
                  ) : null
                }
                hasSearchTool={false}
                tools={bottomTools}
              />
            </Paper>
          );
        }
      })()}
      {pathToAddNewRecord && fillContentArea && isSmallScreenSize ? (
        <Button
          component={RouterLink}
          to={pathToAddNewRecord}
          color="primary"
          variant="contained"
          sx={{
            p: 0,
            minWidth: 'auto',
            width: 50,
            height: 50,
            borderRadius: '50%',
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Button>
      ) : null}
    </Paper>
  );

  if (fillContentArea) {
    return (
      <FixedHeaderContentArea
        BodyProps={{
          sx: {
            display: 'flex',
            flexDirection: 'column',
            overflowY: '',
            overflowX: '',
          },
        }}
        sx={{
          px: 0,
        }}
      >
        {explorerElement}
      </FixedHeaderContentArea>
    );
  }

  return explorerElement;
};

export const RecordsExplorer = forwardRef(BaseRecordsExplorer) as <
  RecordRow extends BaseDataRow,
  View extends ViewOptionType,
  InitialValues extends FormikValues
>(
  p: RecordsExplorerProps<RecordRow, View, InitialValues> & {
    ref?: Ref<HTMLDivElement>;
  }
) => ReactElement;

export default RecordsExplorer;
