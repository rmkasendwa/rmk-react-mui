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
  tableCellClasses,
  tableClasses,
  tableHeadClasses,
  useThemeProps,
} from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import { ReactElement, ReactNode, Ref, forwardRef } from 'react';

import { BaseDataRow, TableColumnType } from '../../interfaces/Table';
import { PermissionCode } from '../../interfaces/Users';
import { PrimitiveDataType } from '../../interfaces/Utils';
import DataTablePagination from '../DataTablePagination';
import FixedHeaderContentArea, {
  FixedHeaderContentAreaProps,
} from '../FixedHeaderContentArea';
import { IconLoadingScreenProps } from '../IconLoadingScreen';
import SearchSyncToolbar from '../SearchSyncToolbar';
import { TableProps } from '../Table';
import { TimelineChartProps } from '../TimelineChart';
import { ViewOptionType, ViewOptionsButtonProps } from './ViewOptionsButton';

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

export type DataView<T extends BaseDataRow> = ListView<T> | TimelineView<T>;

export type FilterBySearchTerm<T> = (searchTerm: string, row: T) => boolean;

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
   * Determines if the limit should be extended when the user scrolls to the bottom.
   */
  loadMoreOnScrollToBottom?: boolean;
  /**
   * The scrollable body element to track to determine if user scrolled to the bottom.
   */
  bodyElement?: HTMLDivElement | null;
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
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiRecordsExplorer' });
  const { className, title, sx, fillContentArea = true, ...rest } = props;

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
            onSearch: onChangeSearchTerm,
            searchFieldPlaceholder,
            tools,
            loading: loading || loadingRecordsExplorer,
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
          if (displayingData.length <= 0) {
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
                recordsCount={displayingData.length}
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
              data: displayingData,
              headerHeight: headerElementRef.current?.offsetHeight,
            });
          }
          return children;
        })()}
      </Box>
      {!noLimit && hiddenResourcesCount > 0 && !loadMoreOnScrollToBottom ? (
        <Box
          className="show-more-button-container"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            pointerEvents: 'none',
            opacity: 0,
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            onClick={loadMoreRows}
            sx={{
              pointerEvents: 'auto',
              fontSize: 12,
              fontWeight: 'normal',
              height: 24,
            }}
          >
            Show more {hiddenResourcesCount}{' '}
            {hiddenResourcesCount === 1
              ? lowercaseRecordLabelSingular
              : lowercaseRecordLabelPlural}
          </Button>
        </Box>
      ) : null}
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
