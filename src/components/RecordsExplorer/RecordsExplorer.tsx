'use client';
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
  Paper,
  PaperProps,
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
  RefObject,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { mergeRefs } from 'react-merge-refs';
import { ObjectShape } from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import { LoadingContext, LoadingProvider } from '../../contexts/LoadingContext';
import { useMessagingContext } from '../../contexts/MessagingContext';
import {
  CacheableDataFinderOptions,
  PaginatedRecordsFinderOptions,
  PaginatedRecordsProps,
  useCacheableData,
  useCreate,
  usePaginatedRecords,
  useUpdate,
} from '../../hooks/DataFetching';
import { SelectedSortOption, SortBy, SortableFields } from '../../models/Sort';
import { PermissionCode } from '../../models/Users';
import { CrudMode, PaginatedResponseData } from '../../models/Utils';
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
import Table, { BaseDataRow, TableProps } from '../Table';
import Timeline, {
  ScrollToDateFunction,
  SelectCustomDatesTimeScaleCallbackFunction,
  SelectTimeScaleCallbackFunction,
  SetDynamicallySelectedTimeScaleFunctionRef,
  TimeScaleOption,
  useScrollTimelineTools,
  useTimeScaleTool,
} from '../Timeline';
import Tooltip from '../Tooltip';
import { useRecordsExplorerNavigationState } from './hooks';
import { DataFilterProps, useDataFilter } from './hooks/DataFilter';
import { FilterToolProps, useFilterTool } from './hooks/FilterTool';
import { useGroupTool } from './hooks/GroupTool';
import { useRecordsExplorerFields } from './hooks/RecordsExplorerFields';
import { useSortTool } from './hooks/SortTool';
import {
  ViewOptionsToolProps,
  useViewOptionsTool,
} from './hooks/ViewOptionsTool';
import {
  ConditionGroup,
  DataFilterField,
  DataGroup,
  DataView,
  FilterBySearchTerm,
  GroupableField,
  ListView,
  NestedDataGroup,
  RecordsExplorerRowField,
  SearchableProperty,
  TimelineView,
  ViewOptionType,
} from './models';

export interface RecordsExplorerClasses {
  /** Styles applied to the root element. */
  root: string;
  header: string;
  section: string;
  footer: string;
}

export type RecordsExplorerClassKey = keyof RecordsExplorerClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRecordsExplorer: RecordsExplorerProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRecordsExplorer: keyof RecordsExplorerClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRecordsExplorer?: {
      defaultProps?: ComponentsProps['MuiRecordsExplorer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRecordsExplorer'];
      variants?: ComponentsVariants['MuiRecordsExplorer'];
    };
  }
}
//#endregion

export const getRecordsExplorerUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiRecordsExplorer', slot);
};

const slots: Record<RecordsExplorerClassKey, [RecordsExplorerClassKey]> = {
  root: ['root'],
  header: ['header'],
  section: ['section'],
  footer: ['footer'],
};

export const recordsExplorerClasses: RecordsExplorerClasses =
  generateUtilityClasses(
    'MuiRecordsExplorer',
    Object.keys(slots) as RecordsExplorerClassKey[]
  );

export interface RecordsExplorerChildrenOptions<
  RecordRow extends BaseDataRow,
  View extends ViewOptionType = ViewOptionType,
  InitialValues extends FormikValues = FormikValues
> extends Partial<
    Omit<RecordsExplorerProps<RecordRow, View, InitialValues>, 'children'>
  > {
  data: RecordRow[];
  filteredData: RecordRow[];
  groupedData?: NestedDataGroup<RecordRow>[];
  flattenedGroupedData: RecordRow[];
  selectedView: View;
  selectedViewProps?: DataView<RecordRow>;
  headerHeight?: number;
  filterFields?: DataFilterField<RecordRow>[];
  filterBy?: Omit<ConditionGroup<RecordRow>, 'conjunction'> &
    Partial<Pick<ConditionGroup<RecordRow>, 'conjunction'>>;
  search: (searchTerm: string) => void;
  sortableFields?: SortableFields<RecordRow>;
  sortBy?: SortBy<RecordRow>;
  groupableFields?: GroupableField<RecordRow>[];
  groupBy?: SortBy<RecordRow>;
  loading?: boolean;
  errorMessage?: string;
  searchParamSelectedDataPreset?: string | number;
  selectedDataPreset?: RecordsExplorerDataPreset<RecordRow>;
  selectedRecord?: RecordRow;
  selectedConditionGroup: FilterToolProps<RecordRow>['selectedConditionGroup'];
  onChangeSelectedConditionGroup: FilterToolProps<RecordRow>['onChangeSelectedConditionGroup'];
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
  RecordRow extends BaseDataRow,
  View extends ViewOptionType = ViewOptionType,
  InitialValues extends FormikValues = FormikValues
> = (
  options: {
    tools: RecordsExplorerTools;
  } & Omit<
    RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>,
    'tools'
  >
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

/**
 * Adds search params to path.
 *
 * @param pathName The path to add search params to.
 */
export type AddRecordsExplorerSearchParamsToPathFunction = (
  pathName: string
) => string;

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
        | 'onChangeMinWidth'
      >
    >,
    Partial<
      Pick<ModalFormProps<InitialValues>, 'validationSchema' | 'editableFields'>
    >,
    Pick<
      PaginatedRecordsProps<RecordRow>,
      'revalidationKey' | 'autoSync' | 'refreshInterval'
    >,
    Pick<DataFilterProps<RecordRow>, 'filter' | 'filterRevalidationKey'> {
  getTitle?: RecordsExplorerFunctionChildren<
    RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
  >;
  getWrappedTitle?: RecordsExplorerFunctionChildren<
    RecordsExplorerChildrenOptions<RecordRow, View, InitialValues> & {
      title: ReactNode;
    }
  >;
  children?:
    | RecordsExplorerFunctionChildren<
        RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
      >
    | ReactNode;
  load?: () => void;
  errorMessage?: string;
  loading?: boolean;
  fillContentArea?: boolean;

  /**
   * The raw data to be processed for displaying.
   */
  data?: RecordRow[];
  groupedData?: NestedDataGroup<RecordRow>[];

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
   * The label to be used when reporting display stats for multiple records in lowercase.
   *
   * @example
   * "records", "things", "people"
   *
   * @default "records"
   */
  lowercaseRecordLabelPlural?: string;

  /**
   * The label to be used when reporting display stats for a single record. If not specifies, the recordLabelPlural property will be used with any trailing 's' removed.
   *
   * @example
   * "Record", "Thing", "Person"
   */
  recordLabelSingular?: string;

  /**
   * The label to be used when reporting display stats for a single record in lowercase. If not specifies, the lowercaseRecordLabelPlural property will be used with any trailing 's' removed.
   *
   * @example
   * "record", "thing", "person"
   */
  lowercaseRecordLabelSingular?: string;

  /**
   * Extra props to be assigned to the ViewOptionsTool component.
   */
  ViewOptionsToolProps?: Partial<ViewOptionsToolProps>;
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
    | ((
        state: RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
      ) => boolean);

  // Form
  editorForm?:
    | RecordsExplorerFunctionEditorForm<RecordRow, InitialValues>
    | ReactNode;
  description?: ReactNode;
  recordsFinder?: RecordsFinder<RecordRow>;
  loadRecordsRef?: RefObject<(() => void) | undefined>;
  selectedRecordId?: string;
  recordDetailsFinder?: (
    selectedRecordId: string,
    cacheableDataFinderOptions: CacheableDataFinderOptions
  ) => Promise<RecordRow>;
  getRecordDetailsLoadFunction?: (loadFunction: () => void) => void;
  getEditableRecordInitialValues?: (record: RecordRow) => any;
  recordCreator?: (values: InitialValues) => any;
  onCreateNewRecord?: (createdRecord: RecordRow) => void;
  recordEditor?: (record: RecordRow, values: InitialValues) => any;
  recordDeletor?: (record: RecordRow) => any;
  initialValues?: InitialValues;
  editValidationSchema?: any | (() => any);
  getTableDataReloadFunction?: (reloadFunction: () => void) => void;
  getCreateFunction?: (createFunction: () => void) => void;
  getPathToAddNewRecord?: (pathToAddNewRecord: string) => void;
  getViewFunction?: (viewFunction: (record: RecordRow) => void) => void;
  getEditFunction?: (editFunction: (record: RecordRow) => void) => void;
  getDeleteFunction?: (editFunction: (record: RecordRow) => void) => void;
  onEditRecord?: (updatedRecord: RecordRow) => void;
  getToolbarElement?: (
    state: {
      baseToolbarElement: ReactElement;
    } & RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
  ) => ReactElement;

  // View Path
  templatePathToView?: string;
  getViewFormTitle?: (record: RecordRow) => ReactNode;
  getViewFormTools?: (record: RecordRow) => ReactNode[];
  getEditFormTitle?: (record: RecordRow) => ReactNode;

  // Edit Path
  templatePathToEdit?: string;
  pathToEdit?: string;
  getPathToEdit?: (record: RecordRow) => string;

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
    | ((
        state: RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
      ) => boolean);
  showSortTool?: boolean;
  showFilterTool?: boolean;
  showResetTool?: boolean;
  PaginatedRecordsOptions?: Partial<PaginatedRecordsProps<RecordRow>>;
  dataPresets?: RecordsExplorerDataPreset<RecordRow>[];
  selectedDataPresetId?: string | number;
  tools?: Tool[];
  bottomTools?: Tool[];
  getBottomTools?: (
    state: RecordsExplorerChildrenOptions<RecordRow, View, InitialValues>
  ) => (ReactNode | Tool)[] | undefined;
  ListViewProps?: Partial<Omit<ListView<RecordRow>, 'columns'>>;
  TimelineViewProps?: Partial<Omit<TimelineView<RecordRow>, 'columns'>>;
  clearSearchStateOnUnmount?: boolean;
  showSuccessMessageOnCreateRecord?: boolean;
  preprocessTools?: RecordsExplorerToolsPreprocessorFunction<
    RecordRow,
    View,
    InitialValues
  >;
  renderExplorerElement?: boolean;
  renderViews?: boolean;
  enableViewSelectedRecordModalPopup?: boolean;
  resetToDefaultView?: () => void;
  showModalForm?: boolean;
  addSearchParamsToPathRef?: RefObject<
    AddRecordsExplorerSearchParamsToPathFunction | undefined
  >;
  subHeaderElement?: ReactNode;
  navigationStateExtension?: ObjectShape;
  showToolbarHeader?: boolean;
}

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
    groupedData: groupedDataProp,
    ViewOptionsToolProps,
    filterFields: filterFieldsProp,
    sortableFields: sortableFieldsProp,
    sortBy: sortByProp,
    groupableFields: groupableFieldsProp,
    groupBy: groupByProp,
    filterBy: filterByProp,
    views,
    selectedView: viewProp,
    permissionToAddNew,
    hideAddNewButtonOnNoFilteredData = false,
    children,
    filterBySearchTerm,
    filter: filterProp,
    filterRevalidationKey,
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
    recordDetailsFinder,
    recordEditor,
    editableFields,
    editValidationSchema,
    getViewFormTitle,
    getViewFormTools,
    getEditFormTitle,
    onEditRecord,
    pathToEdit,
    getPathToEdit,
    getEditableRecordInitialValues,
    recordsFinder,
    revalidationKey,
    recordDeletor,
    getRecordTools,
    recordCreateSuccessMessage,
    recordEditSuccessMessage,
    searchTerm: searchTermProp,
    isSearchable: isSearchableProp = true,
    controlledSearchTerm,
    showViewOptionsTool = true,
    showGroupTool = true,
    showSortTool = true,
    showFilterTool = true,
    showResetTool = true,
    getCreateFunction,
    getPathToAddNewRecord,
    getViewFunction,
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
    renderExplorerElement = true,
    renderViews = true,
    enableViewSelectedRecordModalPopup = true,
    resetToDefaultView: resetToDefaultViewProp,
    onChangeMinWidth,
    showModalForm = true,
    selectedRecordId: selectedRecordIdProp,
    addSearchParamsToPathRef,
    loadRecordsRef,
    subHeaderElement,
    navigationStateExtension,
    getToolbarElement,
    showToolbarHeader = true,
    ...rest
  } = omit(
    props,
    'recordLabelPlural',
    'lowercaseRecordLabelPlural',
    'recordLabelSingular',
    'lowercaseRecordLabelSingular',
    'permissionToViewDetails',
    'addNewButtonLabel'
  );

  let {
    recordLabelPlural,
    lowercaseRecordLabelPlural,
    recordLabelSingular,
    lowercaseRecordLabelSingular,
    addNewButtonLabel,
  } = props;

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
  lowercaseRecordLabelPlural ||
    (lowercaseRecordLabelPlural = recordLabelPlural.toLowerCase());
  lowercaseRecordLabelSingular ||
    (lowercaseRecordLabelSingular = singular(lowercaseRecordLabelPlural));

  addNewButtonLabel || (addNewButtonLabel = `Add New ${recordLabelSingular}`);

  const { sx: HeaderPropsSx, ...HeaderPropsRest } = HeaderProps;
  const { sx: BodyPropsSx, ...BodyPropsRest } = BodyProps;
  const { onChangeSearchTerm, ...SearchSyncToolBarPropsRest } =
    SearchSyncToolBarProps;
  const { ...ModalFormPropsRest } = ModalFormProps;
  const { ...CreateModalFormPropsRest } = CreateModalFormProps;
  const { ...ViewModalFormPropsRest } = ViewModalFormProps;

  //#region Refs
  const isInitialMountRef = useRef(true);

  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const bodyElementRef = useRef<HTMLDivElement | null>(null);
  const getGroupableDataRef = useRef(getGroupableData);
  getGroupableDataRef.current = getGroupableData;
  const viewsPropRef = useRef(views);
  viewsPropRef.current = views;
  const filterByPropRef = useRef(filterByProp);
  filterByPropRef.current = filterByProp;
  const getEditableRecordInitialValuesRef = useRef(
    getEditableRecordInitialValues
  );
  getEditableRecordInitialValuesRef.current = getEditableRecordInitialValues;

  const getCreateFunctionRef = useRef(getCreateFunction);
  getCreateFunctionRef.current = getCreateFunction;

  const getPathToAddNewRecordRef = useRef(getPathToAddNewRecord);
  getPathToAddNewRecordRef.current = getPathToAddNewRecord;

  const getViewFunctionRef = useRef(getViewFunction);
  getViewFunctionRef.current = getViewFunction;

  const getRecordDetailsLoadFunctionRef = useRef(getRecordDetailsLoadFunction);
  getRecordDetailsLoadFunctionRef.current = getRecordDetailsLoadFunction;

  const onChangeMinWidthRef = useRef(onChangeMinWidth);
  onChangeMinWidthRef.current = onChangeMinWidth;

  const dataPresetsRef = useRef(dataPresets);
  dataPresetsRef.current = dataPresets;
  const ListViewPropsRef = useRef(ListViewProps);
  ListViewPropsRef.current = ListViewProps;

  //#endregion

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const descriptionElement = (() => {
    if (description) {
      return (
        <Box
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
        </Box>
      );
    }
  })();

  const { searchParams, setSearchParams, addSearchParamsToPath } =
    useRecordsExplorerNavigationState<RecordRow>({
      id,
      clearSearchStateOnUnmount,
      spec: navigationStateExtension,
    });

  if (addSearchParamsToPathRef) {
    addSearchParamsToPathRef.current = (pathName) => {
      return addSearchParamsToPath(pathName);
    };
  }

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
    selectedRecord: searchParamSelectedRecordId,
    editRecord,
    selectedDataPreset: searchParamSelectedDataPreset,
    timeScale: searchParamsSelectedTimeScale,
    isCustomDatesSelected: isCustomDatesTimeScaleSelected,
    customDateRange,
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

  const createNewRecord = Boolean(searchParamCreateNewRecord);

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

  const selectedColumnIds = useMemo(() => {
    if (searchParamSelectedColumns) {
      return searchParamSelectedColumns;
    }
    if (viewsPropRef.current) {
      const listView = viewsPropRef.current.find(
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
  }, [searchParamSelectedColumns]);

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
      loadOnMount: Boolean(
        renderExplorerElement &&
          (recordsFinder || selectedDataPreset?.recordsFinder)
      ),
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

  if (loadRecordsRef) {
    loadRecordsRef.current = load;
  }

  const data = (() => {
    if ((recordsFinder || dataPresets) && asyncData.length > 0) {
      return asyncData;
    }
    return dataProp || [];
  })();

  //#region Resolving data operation fields
  const { filterFields, sortableFields, groupableFields, searchableFields } =
    useRecordsExplorerFields({
      filterFields: filterFieldsProp,
      sortableFields: sortableFieldsProp,
      searchableFields: searchableFieldsProp,
      groupableFields: groupableFieldsProp,
      fields,
      views,
      filterRevalidationKey,
    });

  const groupableFieldsRef = useRef(groupableFields);
  //#endregion

  const selectedGroupParams = useMemo(() => {
    const groupByParams = groupableFieldsRef.current.reduce(
      (accumulator, groupByParam) => {
        accumulator[groupByParam.id] = groupByParam;
        return accumulator;
      },
      {} as Record<keyof RecordRow, (typeof groupableFieldsRef.current)[number]>
    );

    return ((): SortBy<RecordRow> => {
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
  }, [groupByProp, searchParamGroupBy]);

  const serializedSortByProp = JSON.stringify(sortByProp);
  const selectedSortParams = useMemo(() => {
    const sortByParams = sortableFields.reduce((accumulator, sortByParam) => {
      accumulator[sortByParam.id] = sortByParam;
      return accumulator;
    }, {} as Record<keyof RecordRow, (typeof sortableFields)[number]>);

    return ((): SortBy<RecordRow> => {
      if (
        serializedSortByProp &&
        !modifiedStateKeys?.includes(getHashedSearchParamKey('sortBy')) &&
        (!searchParamSortBy || searchParamSortBy.length <= 0)
      ) {
        return JSON.parse(serializedSortByProp);
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
  }, [
    modifiedStateKeys,
    searchParamSortBy,
    serializedSortByProp,
    sortableFields,
  ]);

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

  const onChangeSelectedConditionGroup: FilterToolProps<RecordRow>['onChangeSelectedConditionGroup'] =
    (conditionGroup) => {
      setSearchParams(
        {
          filterBy: conditionGroup as any,
        },
        { replace: true }
      );
    };

  //#region Filtering data
  const { filteredData: baseFilteredData } = useDataFilter({
    data,
    filterFields,
    searchTerm,
    searchableFields,
    filterBySearchTerm,
    filter: filterProp,
    filterRevalidationKey,
    selectedConditionGroup,
  });
  const filteredData = useMemo(() => {
    //#region Sorting data
    const sortedData = (() => {
      if (selectedSortParams && selectedSortParams.length > 0) {
        return [...baseFilteredData].sort((a, b) => {
          return sort(a, b, selectedSortParams);
        });
      }
      return baseFilteredData;
    })();
    //#endregion

    return sortedData;
  }, [baseFilteredData, selectedSortParams]);
  //#endregion

  //#region Grouping data
  const groupedData =
    useMemo(() => {
      if (selectedGroupParams.length > 0) {
        const groupParams = [...selectedGroupParams];

        const groupData = (
          inputGroupableData: typeof filteredData,
          nestIndex = 0
        ): NestedDataGroup<RecordRow>[] | DataGroup<RecordRow>[] => {
          const currentGroupParams = groupParams[nestIndex];
          const { id, getSortValue, getGroupLabel } = currentGroupParams;
          const groupableData = getGroupableDataRef.current
            ? getGroupableDataRef.current(
                inputGroupableData,
                currentGroupParams
              )
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
    }, [filteredData, selectedGroupParams]) || groupedDataProp;
  //#endregion

  const resetToDefaultView = () => {
    setSearchParams(
      {
        ...Object.fromEntries(
          [
            ...new Set([
              ...(modifiedStateKeys || []),
              ...Object.keys(searchParams).filter((key) => {
                return !unTrackableSearchParams.includes(key);
              }),
            ]),
          ].map((key) => {
            return [key, null];
          })
        ),
        modifiedKeys: null,
      },
      {
        replace: true,
      }
    );
    if (selectedViewType === 'Timeline') {
      resetTimelineToDefaultViewRef.current?.();
    }
    resetToDefaultViewProp?.();
  };

  const {
    create,
    creating,
    created,
    createdRecord,
    errorMessage: createErrorMessage,
    reset: resetCreation,
  } = useCreate(recordCreator!);

  const selectedRecordId = selectedRecordIdProp || searchParamSelectedRecordId;

  const {
    load: loadRecordDetails,
    loading: loadingRecordDetails,
    errorMessage: loadingRecordDetailsErrorMessage,
    data: loadedSelectedRecord,
    reset: resetSelectedRecordState,
  } = useCacheableData(
    async ({ getRequestController, getStaleWhileRevalidate }) => {
      if (recordDetailsFinder && selectedRecordId) {
        return recordDetailsFinder(selectedRecordId, {
          getRequestController,
          getStaleWhileRevalidate,
        });
      }
    },
    {
      revalidationKey: selectedRecordId,
      loadOnMount: Boolean(recordDetailsFinder && selectedRecordId),
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
    updatedRecord,
    errorMessage: updateErrorMessage,
    reset: resetUpdate,
  } = useUpdate(recordEditor!);

  const editInitialValues = useMemo(() => {
    if (getEditableRecordInitialValuesRef.current && selectedRecord) {
      return getEditableRecordInitialValuesRef.current(selectedRecord);
    }
    return { ...(selectedRecord as any) };
  }, [selectedRecord]);

  const allGroupsExpanded = Boolean(
    !searchParamExpandedGroups || searchParamExpandedGroups === 'All'
  );

  const flattenedGroupedData = (() => {
    if (groupedData) {
      const groupRows: RecordRow[] = [];
      const allGroupIds: string[] = [];

      const expandedGroups = (() => {
        if (Array.isArray(searchParamExpandedGroups)) {
          return searchParamExpandedGroups;
        }
        return [];
      })();
      const expandedGroupsInverted = Boolean(searchParamExpandedGroupsInverted);

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
            const groupId = `group:${indentLevel}${id}${parentGroupId || ''}`;
            const groupCollapsed =
              parentGroupCollapsed ||
              (() => {
                if (expandedGroupsInverted) {
                  return expandedGroups.includes(groupId);
                }
                return !expandedGroups.includes(groupId) && !allGroupsExpanded;
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
                          return !expandedGroups.includes(groupId);
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
                    const allCollapsedGroups = allGroupIds.filter((groupId) => {
                      return !allExpandedGroups.includes(groupId);
                    });
                    const nextExpandedGroupsInverted =
                      allCollapsedGroups.length < allExpandedGroups.length;
                    setSearchParams(
                      {
                        expandedGroups: (() => {
                          if (allExpandedGroups.length > 0) {
                            if (
                              groupedData.length === allExpandedGroups.length
                            ) {
                              return 'All';
                            }
                            if (allExpandedGroups.includes('None')) {
                              allExpandedGroups.splice(
                                allExpandedGroups.indexOf('None'),
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
                        expandedGroupsInverted: nextExpandedGroupsInverted,
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
                (children as RecordRow[]).forEach(({ ...rest }) => {
                  groupRows.push({
                    ...rest,
                    GroupingProps: {
                      parentGroupId: groupId,
                      parentGroupIndentLevel: indentLevel,
                      groupCollapsed,
                    },
                  } as RecordRow);
                });
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

      return groupRows;
    }
    return filteredData;
  })();

  const editFunctionRef = useRef((record: RecordRow) => {
    resetSelectedRecordState();
    setSearchParams({
      selectedRecord: record.id,
      editRecord: true,
    });
  });

  const deleteFunctionRef = useRef((record: RecordRow) => {
    record;
    // TODO: Implement Delete function
  });

  const isEditable = Boolean(recordEditor || pathToEdit || getPathToEdit);
  const isDeletable = Boolean(recordDeletor);

  const { showSuccessMessage } = useMessagingContext();

  //#region Timeline view tools
  const selectTimeScaleRef = useRef<SelectTimeScaleCallbackFunction>(undefined);
  const selectCustomDatesTimeScaleRef =
    useRef<SelectCustomDatesTimeScaleCallbackFunction>(undefined);
  const scrollToDateRef = useRef<ScrollToDateFunction>(undefined);
  const jumpToOptimalTimeScaleRef = useRef<() => void>(undefined);
  const jumpToPreviousUnitTimeScaleRef = useRef<() => void>(undefined);
  const jumpToNextUnitTimeScaleRef = useRef<() => void>(undefined);
  const resetTimelineToDefaultViewRef = useRef<() => void>(undefined);
  const selectedTimeScaleRef = useRef<TimeScaleOption>(undefined);
  const timelineDateBoundsRef = useRef<{
    minDate: Date;
    maxDate: Date;
  }>(undefined);
  const currentDateAtStartRef = useRef<Date | null>(null);
  const currentDateAtCenterRef = useRef<Date | null>(null);
  const currentDateAtEndRef = useRef<Date | null>(null);
  const setDynamicallySelectedTimeScaleFunctionRef: SetDynamicallySelectedTimeScaleFunctionRef =
    useRef(undefined);

  const timelineView = views?.find(({ type }) => type === 'Timeline') as
    | TimelineView<RecordRow>
    | undefined;

  const selectedTimeScale = ((): TimeScaleOption | undefined => {
    if (searchParamsSelectedTimeScale) {
      return searchParamsSelectedTimeScale;
    }
    return selectedTimeScaleRef.current;
  })();

  const timeScaleTool = useTimeScaleTool({
    minDate: timelineDateBoundsRef.current?.minDate,
    maxDate: timelineDateBoundsRef.current?.maxDate,
    ...timelineView?.TimeScaleToolProps,
    ...TimelineViewProps?.TimeScaleToolProps,
    selectedTimeScale,
    onSelectTimeScaleFunctionRef: selectTimeScaleRef,
    onSelectCustomDatesTimeScaleFunctionRef: selectCustomDatesTimeScaleRef,
    isCustomDatesTimeScaleSelected,
    supportedTimeScales:
      timelineView?.supportedTimeScales ||
      TimelineViewProps?.supportedTimeScales,
    selectedCustomDates: customDateRange,
    startDateRef: currentDateAtStartRef,
    endDateRef: currentDateAtEndRef,
    setDynamicallySelectedTimeScaleFunctionRef,
  });

  const scrollTimelineTools = useScrollTimelineTools({
    ...timelineView?.ScrollTimelineToolsProps,
    ...TimelineViewProps?.ScrollTimelineToolsProps,
    scrollToDateFunctionRef: scrollToDateRef,
    jumpToOptimalTimeScaleFunctionRef: jumpToOptimalTimeScaleRef,
    jumpToPreviousUnitTimeScaleFunctionRef: jumpToPreviousUnitTimeScaleRef,
    jumpToNextUnitTimeScaleFunctionRef: jumpToNextUnitTimeScaleRef,
    JumpToDateToolProps: {
      minDate: timelineDateBoundsRef.current?.minDate,
      maxDate: timelineDateBoundsRef.current?.maxDate,
      selectedDate: currentDateAtCenterRef.current,
    },
  });
  //#endregion

  const selectedViewProps = (() => {
    const baseSelectedViewProps = views?.find(
      ({ type }) => type === selectedViewType
    );
    if (baseSelectedViewProps) {
      const selectedViewProps = { ...baseSelectedViewProps };
      switch (selectedViewProps.type) {
        case 'List': {
          const {
            enableColumnDisplayToggle = true,
            enableSmallScreenOptimization = enableSmallScreenOptimizationProp,
            enableCheckboxAllRowSelector = enableCheckboxAllRowSelectorProp,
            enableCheckboxRowSelectors = enableCheckboxRowSelectorsProp,
            showRowNumber = showRowNumberProp,
          } = { ...selectedViewProps, ...ListViewProps };

          return {
            onChangeMinWidth,
            ...selectedViewProps,
            ...ListViewProps,
            enableColumnDisplayToggle,
            enableSmallScreenOptimization,
            enableCheckboxAllRowSelector,
            enableCheckboxRowSelectors,
            showRowNumber,
          };
        }
        case 'Timeline': {
          const { ...viewProps } = omit(
            { ...selectedViewProps, ...TimelineViewProps },
            'type'
          ) as TimelineView<RecordRow>;
          if (!viewProps.getRowLabel && !viewProps.rowLabelProperty) {
            const listView = views?.find(({ type }) => type === 'List') as
              | ListView<RecordRow>
              | undefined;
            if (listView && listView.columns.length > 0) {
              viewProps.rowLabelProperty = listView.columns[0].id;
              viewProps.getRowLabel = listView.columns[0].getColumnValue as any;
              viewProps.RowLabelColumnProps = listView.columns[0];
            }
          }
          return {
            onChangeMinWidth,
            setDynamicallySelectedTimeScaleFunctionRef,
            ...selectedViewProps,
            ...TimelineViewProps,
            ...viewProps,
          };
        }
      }
    }
    return baseSelectedViewProps;
  })();

  const search = (searchTerm: string) => {
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
  };

  //#region State
  const state: RecordsExplorerChildrenOptions<RecordRow, View, InitialValues> =
    {
      ...props,
      selectedView: selectedViewType,
      data,
      filteredData,
      flattenedGroupedData,
      groupedData,
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
      selectedViewProps,
      selectedRecord,
      search,
      selectedConditionGroup,
      onChangeSelectedConditionGroup,
    };
  //#endregion

  //#region View Element
  const viewElement = (() => {
    if (selectedViewProps && renderViews) {
      const { type, renderView = true } = selectedViewProps;
      const groupedDataViewProps = (() => {
        if (groupedData) {
          return {
            isGroupedTable: true,
            TableGroupingProps: {
              allGroupsCollapsed: !allGroupsExpanded,
              onChangeAllGroupsCollapsed: (allGroupsExpanded) => {
                setSearchParams(
                  {
                    expandedGroups: allGroupsExpanded ? 'None' : 'All',
                    expandedGroupsInverted: null,
                  },
                  {
                    replace: true,
                  }
                );
              },
            },
          } as Pick<TableProps, 'isGroupedTable' | 'TableGroupingProps'>;
        }
      })();
      if (renderView) {
        switch (type) {
          case 'List': {
            const { ...viewProps } = omit(
              selectedViewProps,
              'type',
              'minWidth',
              'mergeTools',
              'renderView'
            ) as ListView<RecordRow>;
            const {
              enableColumnDisplayToggle,
              enableSmallScreenOptimization,
              enableCheckboxAllRowSelector,
              enableCheckboxRowSelectors,
              showRowNumber,
              getEllipsisMenuToolProps,
              onClickRow,
            } = selectedViewProps;
            const displayingColumns = selectedViewProps.columns.filter(
              ({ id }) => {
                return selectedColumnIds.includes(String(id) as any);
              }
            );
            const { columns, sx } = viewProps;
            const baseTableColumns = columns.map((column) => ({
              ...column,
            }));

            if (groupedData) {
              const firstDisplayingColumn = baseTableColumns.find(({ id }) => {
                return id === displayingColumns[0].id;
              });
              if (firstDisplayingColumn) {
                delete firstDisplayingColumn.width;
              }
            }

            const baseTableProps: typeof viewProps = {
              startStickyColumnIndex: 0,
              showStartStickyColumnDivider: true,
              showEndStickyColumnDivider: true,
              bordersVariant: 'square',
              ...viewProps,
              ...ListViewProps,
              enableColumnDisplayToggle,
              enableCheckboxAllRowSelector,
              enableCheckboxRowSelectors,
              enableSmallScreenOptimization,
              showRowNumber,
              clearSearchStateOnUnmount,
              id,
              ...(() => {
                if (isEditable || isDeletable || getRecordTools) {
                  return {
                    getEllipsisMenuToolProps: (row) => {
                      const ellipsisMenuToolProps = (() => {
                        if (getEllipsisMenuToolProps) {
                          return getEllipsisMenuToolProps(row);
                        }
                      })();
                      const options = ellipsisMenuToolProps?.options || [];

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
              onClickRow,
            };
            const tableControlProps: Partial<typeof viewProps> = {
              sortable: true,
              handleSortOperations: false,
              sortBy: selectedSortParams,
              onChangeSortBy: (sortOptions) => {
                if (
                  sortOptions
                    .map(({ id, sortDirection }) => String(id) + sortDirection)
                    .join(',') !==
                  selectedSortParams
                    .map(({ id, sortDirection }) => String(id) + sortDirection)
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
                          ([selectedSortParam]) => selectedSortParam != null
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
            };

            return (
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <Table
                  {...baseTableProps}
                  {...tableControlProps}
                  columns={baseTableColumns}
                  rows={flattenedGroupedData}
                  {...groupedDataViewProps}
                  scrollableElementRef={bodyElementRef}
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
              </Box>
            );
          }
          case 'Timeline': {
            const { mergeTools, onClickRow, ...viewProps } = omit(
              { ...selectedViewProps, ...TimelineViewProps },
              'type',
              'renderView'
            ) as TimelineView<RecordRow>;
            return (
              <Timeline
                {...viewProps}
                {...{
                  id,
                  clearSearchStateOnUnmount,
                  currentDateAtStartRef,
                  currentDateAtCenterRef,
                  currentDateAtEndRef,
                }}
                rows={flattenedGroupedData}
                {...groupedDataViewProps}
                defaultViewResetFunctionRef={resetTimelineToDefaultViewRef}
                onChangeSelectedTimeScale={(selectedTimeScale) => {
                  selectedTimeScaleRef.current = selectedTimeScale;
                }}
                onChangeTimelineDateBounds={(dateBounds) => {
                  timelineDateBoundsRef.current = dateBounds;
                }}
                onChangeCurrentDateAtCenter={(currentDateAtCenter) => {
                  currentDateAtCenterRef.current = currentDateAtCenter;
                }}
                scrollToDateFunctionRef={scrollToDateRef}
                selectTimeScaleFunctionRef={selectTimeScaleRef}
                selectCustomDatesTimeScaleFunctionRef={
                  selectCustomDatesTimeScaleRef
                }
                jumpToOptimalTimeScaleFunctionRef={jumpToOptimalTimeScaleRef}
                jumpToPreviousUnitTimeScaleFunctionRef={
                  jumpToPreviousUnitTimeScaleRef
                }
                jumpToNextUnitTimeScaleFunctionRef={jumpToNextUnitTimeScaleRef}
                showToolBar={!mergeTools}
                onClickRow={onClickRow}
              />
            );
          }
        }
      }
    }
    if (typeof children === 'function') {
      return children(state);
    }
    return children;
  })() as ReactNode | undefined;
  //#endregion

  useEffect(() => {
    if (filteredData.length <= 0) {
      onChangeMinWidthRef.current?.();
    }
  }, [filteredData.length]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

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
          view,
        },
        {
          replace: true,
        }
      );
    },
  });

  const groupTool = useGroupTool({
    groupableFields,
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

  //#region Filter Tool
  const filterTool = useFilterTool({
    data,
    filterFields,
    selectedConditionGroup,
    onChangeSelectedConditionGroup,
  });
  //#endregion

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
      };
    }
  }

  if (showResetTool && modifiedStateKeys && modifiedStateKeys.length > 0) {
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

    if (toolsLookup['RESET_TO_DEFAULT_VIEW']) {
      tools.push(
        {
          type: 'divider',
        },
        toolsLookup['RESET_TO_DEFAULT_VIEW']
      );
    }
    return tools;
  })();
  //#endregion

  //#region Popup Elements
  const popupElements = (() => {
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box>Add New {recordLabelSingular}</Box>
                  {descriptionElement}
                </Box>
              }
              submitButtonText={`Add ${recordLabelSingular}`}
              {...modalFormProps}
              {...CreateModalFormPropsRest}
              initialValues={initialValues || {}}
              validationSchema={validationSchema || {}}
              open={showModalForm && createNewRecord}
              errorMessage={createErrorMessage}
              loading={creating || created}
              onSubmit={async (values) => {
                if (recordCreator) {
                  await create(values);
                }
              }}
              onClose={async () => {
                await modalFormProps.onClose?.();
                await CreateModalFormPropsRest.onClose?.();
                if (created) {
                  autoSync && renderExplorerElement && (await load());
                  await onCreateNewRecord?.(createdRecord);
                  if (showSuccessMessageOnCreateRecord) {
                    showSuccessMessage(
                      recordCreateSuccessMessage ||
                        `The new ${lowercaseRecordLabelSingular} was created successfully`
                    );
                  }
                }
                resetCreation();
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
            if (enableViewSelectedRecordModalPopup) {
              const loadingState = {
                loading: Boolean(
                  !selectedRecord &&
                    (loadingRecordDetails || loadingProp || loading)
                ),
                errorMessage: !selectedRecord
                  ? loadingRecordDetailsErrorMessage
                  : '',
                load: loadRecordDetails,
                locked: !editRecord,
              };
              const viewModalProps = {
                ...ViewModalFormPropsRest,
                ...modalFormProps,
              };
              return (
                <LoadingProvider value={loadingState}>
                  <ModalForm
                    showEditButton={Boolean(recordEditor)}
                    title={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box>
                          {(() => {
                            if (editRecord) {
                              if (getEditFormTitle && selectedRecord) {
                                return getEditFormTitle(selectedRecord);
                              }
                              return `Edit ${recordLabelSingular}`;
                            }
                            if (getViewFormTitle && selectedRecord) {
                              return getViewFormTitle(selectedRecord);
                            }
                            return recordLabelSingular;
                          })()}
                        </Box>
                        {descriptionElement}
                      </Box>
                    }
                    submitButtonText={`Update ${recordLabelSingular}`}
                    {...viewModalProps}
                    editableFields={editableFields}
                    validationSchema={editValidationSchema || validationSchema}
                    initialValues={editInitialValues || {}}
                    open={Boolean(showModalForm && selectedRecordId)}
                    errorMessage={updateErrorMessage}
                    loading={updating || updated}
                    onSubmit={async (values) => {
                      if (recordEditor && selectedRecord) {
                        await update(selectedRecord, values);
                      }
                    }}
                    onClose={async () => {
                      await modalFormProps.onClose?.();
                      await ViewModalFormProps.onClose?.();
                      if (updated) {
                        autoSync && renderExplorerElement && (await load());
                        await onEditRecord?.(updatedRecord);
                        showSuccessMessage(
                          recordEditSuccessMessage ||
                            `The ${lowercaseRecordLabelSingular} was updated successfully`
                        );
                      }
                      resetUpdate();
                      resetSelectedRecordState();
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
                    viewModeTools={[
                      ...(viewModalProps.viewModeTools || []),
                      ...(() => {
                        if (getViewFormTools && selectedRecord) {
                          return getViewFormTools(selectedRecord);
                        }
                        return [];
                      })(),
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
            }
          })()}
        </>
      );
    }
  })();
  //#endregion

  if (!renderExplorerElement) {
    return <>{popupElements}</>;
  }

  //#region Toobar Element
  const toolbarElement = (
    <>
      <SearchSyncToolbar
        searchFieldPlaceholder={`Filter ${lowercaseRecordLabelPlural}`}
        hasSearchTool={isSearchable}
        searchFieldOpen
        searchVelocity={300}
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
        {...SearchSyncToolBarPropsRest}
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
        onSearch={search}
      />
      <Divider />
    </>
  );
  //#endregion

  //#region Explorer Element
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
      {showToolbarHeader ? (
        <Paper
          elevation={0}
          {...HeaderPropsRest}
          ref={headerElementRef}
          className={clsx(classes.header, HeaderPropsRest.className)}
          component="header"
          sx={{ position: 'sticky', top: 0, zIndex: 100, ...HeaderPropsSx }}
        >
          {getToolbarElement
            ? getToolbarElement({
                ...state,
                baseToolbarElement: toolbarElement,
              })
            : toolbarElement}
        </Paper>
      ) : null}
      {subHeaderElement}
      <Box
        {...BodyPropsRest}
        ref={mergeRefs([bodyElementRef, BodyPropsRest.ref as any])}
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
              overflowY: 'hidden',
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
                load={loadProp ?? load}
                loading={loadingProp ?? loading}
                errorMessage={errorMessageProp ?? errorMessage}
                recordsCount={filteredData.length}
              />
            );
          }
          return viewElement;
        })()}
        {popupElements}
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
      {fillContentArea && isSmallScreenSize ? (
        <Button
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
  //#endregion

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
