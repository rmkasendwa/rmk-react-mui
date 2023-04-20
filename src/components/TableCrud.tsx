import { addSearchParams, matchPath } from '@infinite-debugger/rmk-utils/paths';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
import {
  Button,
  Card,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  IconButton,
  Slide,
  Tooltip,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  outlinedInputClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { FormikValues } from 'formik';
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
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { LoadingContext, LoadingProvider } from '../contexts/LoadingContext';
import { useReactRouterDOMSearchParams } from '../hooks/ReactRouterDOM';
import {
  UsePaginatedRecordsOptions,
  useCreate,
  useDelete,
  usePaginatedRecords,
  useRecord,
  useUpdate,
} from '../hooks/Utils';
import { CrudMode, PaginatedResponseData } from '../interfaces/Utils';
import IconLoadingScreen from './IconLoadingScreen';
import ModalForm, {
  ModalFormFunctionChildren,
  ModalFormProps,
} from './ModalForm';
import { PageTitleProps } from './PageTitle';
import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';
import Table, { BaseDataRow, TableProps } from './Table';

export interface TableCrudClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TableCrudClassKey = keyof TableCrudClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTableCrud: TableCrudProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTableCrud: keyof TableCrudClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTableCrud?: {
      defaultProps?: ComponentsProps['MuiTableCrud'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTableCrud'];
      variants?: ComponentsVariants['MuiTableCrud'];
    };
  }
}

export interface TableCrudProps<
  RecordRow extends BaseDataRow = BaseDataRow,
  InitialValues extends FormikValues = FormikValues
> extends Pick<TableProps<RecordRow>, 'columns'>,
    Partial<Omit<TableProps<RecordRow>, 'columns'>>,
    Partial<
      Pick<
        ModalFormProps<InitialValues>,
        'validationSchema' | 'editableFields' | 'placement'
      >
    >,
    Pick<PageTitleProps, 'tools'>,
    Pick<
      UsePaginatedRecordsOptions<RecordRow>,
      'revalidationKey' | 'autoSync'
    > {
  title?: ReactNode;
  children?:
    | ModalFormFunctionChildren<
        InitialValues,
        {
          mode: CrudMode;
          selectedRecord?: RecordRow | null;
          loadingState: LoadingContext;
        }
      >
    | ReactNode;
  description?: ReactNode;
  recordsFinder: (
    options: Pick<
      UsePaginatedRecordsOptions<RecordRow>,
      'limit' | 'offset' | 'searchTerm'
    >
  ) => Promise<PaginatedResponseData<RecordRow>>;
  recordDetailsFinder?: (selectedRecordId: string) => Promise<RecordRow>;
  getEditableRecordInitialValues?: (record: RecordRow) => any;
  recordCreator?: (values: InitialValues) => any;
  recordEditor?: (record: RecordRow, values: InitialValues) => any;
  recordDeletor?: (record: RecordRow) => any;
  recordKey?: string;
  initialValues?: InitialValues;
  editValidationSchema?: any | (() => any);
  defaultPath?: string;
  pathToAddNew?: string;
  getTableDataReloadFunction?: (reloadFunction: () => void) => void;
  getCreateFunction?: (createFunction: () => void) => void;
  getEditFunction?: (editFunction: (record: RecordRow) => void) => void;
  getDeleteFunction?: (editFunction: (record: RecordRow) => void) => void;
  onEditRecord?: () => void;
  getToolbarElement?: (toolbarElement: ReactElement) => ReactElement;

  // View Path
  templatePathToView?: string;
  pathToView?: string;
  getPathToView?: (record: RecordRow) => string;
  viewableRecordIdPathParamKey?: string;
  getViewTitle?: (record: RecordRow) => ReactNode;

  // Edit Path
  templatePathToEdit?: string;
  pathToEdit?: string;
  getPathToEdit?: (record: RecordRow) => string;

  showRecords?: boolean;

  getExtraRowTools?: (record: RecordRow) => ReactNode;
  extraActionsColumnWidth?: number;

  SearchSyncToolbarProps?: Partial<SearchSyncToolbarProps>;

  ModalFormProps?: Partial<ModalFormProps>;
}

export function getTableCrudUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTableCrud', slot);
}

export const tableCrudClasses: TableCrudClasses = generateUtilityClasses(
  'MuiTableCrud',
  ['root']
);

const slots = {
  root: ['root'],
};

const BaseTableCrud = <
  RecordRow extends BaseDataRow,
  InitialValues extends FormikValues
>(
  inProps: TableCrudProps<RecordRow, InitialValues>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTableCrud' });
  const {
    title,
    description,
    columns,
    selectedColumnIds,
    recordsFinder,
    recordDetailsFinder,
    getEditableRecordInitialValues,
    recordCreator,
    recordEditor,
    recordDeletor,
    recordKey,
    initialValues,
    validationSchema,
    editableFields,
    revalidationKey = '',
    tools = [],
    children,
    PaginatedTableWrapperProps = {},
    pathToAddNew,
    templatePathToEdit,
    pathToEdit,
    getPathToEdit,
    pathToView,
    getPathToView,
    onClickRow,
    defaultPath,
    viewableRecordIdPathParamKey,
    editValidationSchema,
    getTableDataReloadFunction,
    getCreateFunction,
    getEditFunction,
    getDeleteFunction,
    getToolbarElement,
    onEditRecord,
    sx,
    className,
    showRecords = true,
    autoSync = true,
    getExtraRowTools,
    extraActionsColumnWidth,
    SearchSyncToolbarProps = {},
    getViewTitle,
    placement = 'right',
    ModalFormProps = {},
    ...rest
  } = omit(props, 'labelPlural', 'labelSingular');

  let { labelPlural, labelSingular } = props;

  const classes = composeClasses(
    slots,
    getTableCrudUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  if (!labelPlural && typeof title === 'string') {
    labelPlural = title;
  }
  if (!labelSingular && labelPlural) {
    labelSingular = labelPlural.replace(/s$/gi, '');
  }

  const lowercaseLabelSingular = (labelSingular || '').toLowerCase();

  const {
    sx: PaginatedTableWrapperPropsSx,
    ...PaginatedTableWrapperPropsRest
  } = PaginatedTableWrapperProps;

  const { sx: SearchSyncToolbarPropsSx, ...SearchSyncToolbarPropsRest } =
    SearchSyncToolbarProps;

  const { ...ModalFormPropsRest } = ModalFormProps;

  // Refs
  const getEditableRecordInitialValuesRef = useRef(
    getEditableRecordInitialValues
  );
  getEditableRecordInitialValuesRef.current = getEditableRecordInitialValues;
  const getExtraRowToolsRef = useRef(getExtraRowTools);
  getExtraRowToolsRef.current = getExtraRowTools;

  const {
    createRecordSearchParamKey,
    viewRecordSearchParamKey,
    editRecordSearchParamKey,
  } = useMemo(() => {
    const key = (labelSingular || 'Record').replace(/\s/g, '');
    return {
      createRecordSearchParamKey: `create${key}`,
      viewRecordSearchParamKey: `selected${key}`,
      editRecordSearchParamKey: `edit`,
    };
  }, [labelSingular]);

  const { palette, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useReactRouterDOMSearchParams();

  const searchEntries = searchParams.entries();
  const allSearchParams: Record<string, string> = {};
  for (const [key, value] of searchEntries) {
    allSearchParams[key] = value;
  }

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletableRecordId, setDeletableRecordId] = useState<string | number>(
    ''
  );
  const viewableRecordId = (() => {
    if (viewableRecordIdPathParamKey && params[viewableRecordIdPathParamKey]) {
      return params[viewableRecordIdPathParamKey];
    }
    return searchParams.get(viewRecordSearchParamKey);
  })();
  const editRecord = (() => {
    if (templatePathToEdit) {
      return matchPath(templatePathToEdit, pathname);
    }
    return (
      String(searchParams.get(editRecordSearchParamKey)).toLowerCase() ===
      'true'
    );
  })();

  // Record creation state
  const createNewRecord =
    searchParams.get(createRecordSearchParamKey) === 'true' ||
    pathToAddNew === pathname;
  const {
    create,
    creating,
    created,
    errorMessage: createErrorMessage,
    reset: resetCreation,
  } = useCreate(recordCreator!);

  // Record loading
  const { currentPageRecords, load, loading, errorMessage, recordsTotalCount } =
    usePaginatedRecords(
      () => {
        return recordsFinder({
          limit,
          offset,
          searchTerm,
        });
      },
      {
        limit,
        offset,
        key: recordKey,
        revalidationKey: `${revalidationKey}${searchTerm}`,
        loadOnMount: showRecords,
        autoSync,
      }
    );

  const createFunctionRef = useRef(() => {
    if (pathToAddNewRecord) {
      navigate(pathToAddNewRecord);
    }
  });

  const editFunctionRef = useRef((record: RecordRow) => {
    navigate(
      (() => {
        if (pathToEdit) {
          return pathToEdit;
        }
        if (getPathToEdit) {
          return getPathToEdit(record);
        }
        return addSearchParams(pathname, {
          ...allSearchParams,
          [viewRecordSearchParamKey]: String(record.id),
          [editRecordSearchParamKey]: 'true',
        });
      })()
    );
  });

  const deleteFunctionRef = useRef((record: RecordRow) => {
    setDeletableRecordId(record.id);
    setSelectedRecord(record);
  });

  useEffect(() => {
    if (getTableDataReloadFunction) {
      getTableDataReloadFunction(load);
    }
  }, [getTableDataReloadFunction, load]);

  useEffect(() => {
    if (getCreateFunction) {
      getCreateFunction(createFunctionRef.current);
    }
  }, [getCreateFunction]);

  useEffect(() => {
    if (getEditFunction) {
      getEditFunction(editFunctionRef.current);
    }
  }, [getEditFunction]);

  useEffect(() => {
    if (getDeleteFunction) {
      getDeleteFunction(deleteFunctionRef.current);
    }
  }, [getDeleteFunction]);

  // Record editing state
  const {
    update,
    updating,
    updated,
    errorMessage: updateErrorMessage,
    reset: resetUpdate,
  } = useUpdate(recordEditor!);

  // Record deleting state
  const {
    _delete,
    deleting,
    deleted,
    errorMessage: deleteErrorMessage,
    reset: resetDeletionState,
  } = useDelete(recordDeletor!);

  useEffect(() => {
    if (deleted) {
      setDeletableRecordId('');
      autoSync && load();
    }
  }, [autoSync, deleted, load, resetDeletionState]);

  const {
    load: loadRecordDetails,
    loading: loadingRecordDetails,
    errorMessage: loadingRecordDetailsErrorMessage,
    record: selectedRecord,
    setRecord: setSelectedRecord,
  } = useRecord(
    async () => {
      if (recordDetailsFinder) {
        if (viewableRecordId) {
          return recordDetailsFinder(viewableRecordId);
        }
      }
    },
    {
      loadOnMount: false,
    }
  );

  const editInitialValues = (() => {
    if (getEditableRecordInitialValuesRef.current && selectedRecord) {
      return getEditableRecordInitialValuesRef.current(selectedRecord);
    }
    return { ...initialValues, ...(selectedRecord as any) };
  })();

  useEffect(() => {
    if (viewableRecordId) {
      loadRecordDetails();
    }
  }, [loadRecordDetails, viewableRecordId]);

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

  const pathToAddNewRecord = (() => {
    if (pathToAddNew) {
      return pathToAddNew;
    }
    if (validationSchema && recordCreator) {
      return addSearchParams(pathname, {
        ...allSearchParams,
        [createRecordSearchParamKey]: 'true',
      });
    }
  })();

  const isEditable = Boolean(recordEditor || pathToEdit || getPathToEdit);
  const isDeletable = Boolean(recordDeletor);

  const toolbarElement = (
    <SearchSyncToolbar
      {...SearchSyncToolbarPropsRest}
      {...{ load, loading, errorMessage, searchTerm }}
      title={(() => {
        if (title) {
          return (
            <Grid
              container
              sx={{
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Grid item>{title}</Grid>
              {descriptionElement}
            </Grid>
          );
        }
      })()}
      hasSearchTool
      searchFieldOpen
      onSearch={(searchTerm) => setSearchTerm(searchTerm)}
      searchFieldPlaceholder={`Search ${labelPlural}`}
      tools={[
        ...tools,
        ...(() => {
          if (pathToAddNewRecord) {
            return [
              <Button
                key="addButton"
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to={pathToAddNewRecord}
              >
                Add {labelSingular}
              </Button>,
            ];
          }
          return [];
        })(),
      ]}
      sx={{
        [`.${outlinedInputClasses.root}`]: {
          bgcolor: palette.background.paper,
        },
        ...SearchSyncToolbarPropsSx,
      }}
    />
  );

  return (
    <>
      {(() => {
        if (showRecords) {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {(() => {
                if (getToolbarElement) {
                  return getToolbarElement(toolbarElement);
                }
                return toolbarElement;
              })()}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Divider />
                {(() => {
                  if (recordsTotalCount <= 0 && (loading || errorMessage)) {
                    return (
                      <IconLoadingScreen
                        {...{ errorMessage, load, loading }}
                        recordLabelPlural={labelPlural}
                        recordLabelSingular={labelSingular}
                        pathToAddNew={pathToAddNewRecord}
                      />
                    );
                  }
                  return (
                    <Table
                      stickyHeader
                      minColumnWidth={220}
                      enableColumnDisplayToggle
                      textTransform
                      ref={ref}
                      {...rest}
                      className={clsx(classes.root)}
                      {...{ labelPlural, labelSingular }}
                      columns={[
                        ...columns,
                        ...(() => {
                          if (
                            isEditable ||
                            isDeletable ||
                            getExtraRowToolsRef.current
                          ) {
                            return [
                              {
                                id: 'actions' as any,
                                label: 'Actions',
                                width: (() => {
                                  let width = 0;
                                  isEditable && (width += 42);
                                  isDeletable && (width += 42);
                                  extraActionsColumnWidth &&
                                    (width += extraActionsColumnWidth);
                                  return width;
                                })(),
                                getColumnValue: (record) => {
                                  return (
                                    <Grid
                                      className="row-tools"
                                      container
                                      sx={{
                                        justifyContent: 'end',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {getExtraRowToolsRef.current ? (
                                        <Grid
                                          item
                                          xs
                                          sx={{
                                            minWidth: 0,
                                          }}
                                        >
                                          {getExtraRowToolsRef.current(record)}
                                        </Grid>
                                      ) : null}
                                      {(() => {
                                        if (isEditable) {
                                          return (
                                            <Grid item>
                                              <Tooltip
                                                title="Edit"
                                                PopperProps={{
                                                  sx: {
                                                    pointerEvents: 'none',
                                                  },
                                                }}
                                              >
                                                <IconButton
                                                  onClick={() => {
                                                    editFunctionRef.current(
                                                      record
                                                    );
                                                  }}
                                                >
                                                  <EditIcon color="inherit" />
                                                </IconButton>
                                              </Tooltip>
                                            </Grid>
                                          );
                                        }
                                      })()}
                                      {isDeletable ? (
                                        <Grid item>
                                          <Tooltip
                                            title="Delete"
                                            PopperProps={{
                                              sx: {
                                                pointerEvents: 'none',
                                              },
                                            }}
                                          >
                                            <IconButton
                                              onClick={() => {
                                                deleteFunctionRef.current(
                                                  record
                                                );
                                              }}
                                            >
                                              <DeleteOutlineIcon color="error" />
                                            </IconButton>
                                          </Tooltip>
                                        </Grid>
                                      ) : null}
                                    </Grid>
                                  );
                                },
                                showHeaderText: false,
                                opaque: true,
                                propagateClickToParentRowClickEvent: false,
                                sx: {
                                  position: 'sticky',
                                  right: 0,
                                  '&,&>div': {
                                    p: 0,
                                  },
                                },
                              },
                            ] as typeof columns;
                          }
                          return [];
                        })(),
                      ]}
                      selectedColumnIds={(() => {
                        if (selectedColumnIds) {
                          return [
                            'number',
                            ...(() => {
                              if (selectedColumnIds) {
                                return selectedColumnIds;
                              }
                              return [];
                            })(),
                            'actions',
                          ] as any;
                        }
                      })()}
                      rows={currentPageRecords}
                      onClickRow={
                        onClickRow ??
                        ((record) => {
                          const { id } = record;
                          const pathToViewRecord = (() => {
                            if (pathToView) {
                              return pathToView;
                            }
                            if (getPathToView) {
                              return getPathToView(record);
                            }
                            return addSearchParams(pathname, {
                              ...allSearchParams,
                              [viewRecordSearchParamKey]: String(id),
                            });
                          })();
                          navigate(pathToViewRecord);
                        })
                      }
                      totalRowCount={recordsTotalCount}
                      rowsPerPage={limit}
                      onRowsPerPageChange={(rowsPerPage) => {
                        setLimit(rowsPerPage);
                      }}
                      onChangePage={(pageIndex) => {
                        setOffset(limit * pageIndex);
                      }}
                      PaginatedTableWrapperProps={{
                        ...PaginatedTableWrapperPropsRest,
                        sx: {
                          bgcolor: palette.background.paper,
                          ...PaginatedTableWrapperPropsSx,
                          flex: 1,
                          minHeight: 0,
                          overflow: 'hidden',
                        },
                      }}
                      showRowNumber
                      sx={{
                        ...sx,
                        tr: {
                          ...(sx as any)?.tr,
                        },
                      }}
                    />
                  );
                })()}
              </Box>
              {pathToAddNewRecord && isSmallScreenSize ? (
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
            </Box>
          );
        }
      })()}
      {(() => {
        if (
          (viewableRecordId || (validationSchema && initialValues)) &&
          children
        ) {
          const hasFormProps = Boolean(validationSchema && initialValues);
          const modalFormProps: Partial<ModalFormProps> = {
            placement,
            showCloseIconButton: false,
            ...ModalFormPropsRest,
            FormikProps: {
              enableReinitialize: true,
            },
            SearchSyncToolbarProps: {
              TitleProps: {
                sx: {
                  fontSize: 24,
                  fontWeight: 500,
                },
              },
            },
          };
          return (
            <>
              {/* Create Form */}
              {hasFormProps ? (
                <ModalForm
                  lockSubmitIfNoChange={false}
                  {...modalFormProps}
                  {...{
                    validationSchema,
                    initialValues,
                  }}
                  open={createNewRecord}
                  errorMessage={createErrorMessage}
                  title={
                    <Grid
                      container
                      sx={{
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Grid item>Create New {labelSingular}</Grid>
                      {descriptionElement}
                    </Grid>
                  }
                  submitButtonText="Create"
                  loading={creating}
                  onSubmit={async (values) => {
                    if (recordCreator) {
                      await create(values);
                    }
                  }}
                  onClose={() => {
                    resetCreation();
                    if (created) {
                      autoSync && load();
                    }
                    if (defaultPath) {
                      navigate(defaultPath);
                    } else {
                      setSearchParams({
                        [createRecordSearchParamKey]: null,
                      });
                    }
                  }}
                  getModalElement={(modalElement) => {
                    return (
                      <Slide
                        direction="left"
                        in={createNewRecord}
                        mountOnEnter
                        unmountOnExit
                      >
                        {modalElement}
                      </Slide>
                    );
                  }}
                  submitted={created}
                >
                  {({ ...rest }) => {
                    if (typeof children === 'function') {
                      return children({
                        mode: 'create',
                        loadingState: {
                          loading: false,
                        },
                        ...rest,
                      });
                    }
                    return children;
                  }}
                </ModalForm>
              ) : null}

              {/* Edit Form */}
              {(() => {
                const loadingState = {
                  loading: loadingRecordDetails,
                  errorMessage: loadingRecordDetailsErrorMessage,
                  load: loadRecordDetails,
                  locked: !editRecord,
                };
                return (
                  <LoadingProvider value={loadingState}>
                    <ModalForm
                      showEditButton={Boolean(recordEditor)}
                      {...modalFormProps}
                      {...{
                        editableFields,
                      }}
                      validationSchema={
                        editValidationSchema || validationSchema
                      }
                      initialValues={editInitialValues}
                      open={Boolean(viewableRecordId)}
                      errorMessage={updateErrorMessage}
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
                                return `Edit ${labelSingular}`;
                              }
                              if (getViewTitle && selectedRecord) {
                                return getViewTitle(selectedRecord);
                              }
                              return labelSingular;
                            })()}
                          </Grid>
                          {descriptionElement}
                        </Grid>
                      }
                      submitButtonText="Update"
                      loading={updating}
                      onSubmit={async (values) => {
                        if (recordEditor && selectedRecord) {
                          await update(selectedRecord, values);
                        }
                      }}
                      onClose={() => {
                        resetUpdate();
                        if (updated) {
                          onEditRecord && onEditRecord();
                          autoSync && load();
                        }
                        if (defaultPath) {
                          navigate(defaultPath);
                        } else {
                          setSearchParams({
                            [viewRecordSearchParamKey]: null,
                            [editRecordSearchParamKey]: null,
                          });
                        }
                      }}
                      getModalElement={(modalElement) => {
                        return (
                          <Slide
                            direction="left"
                            in={Boolean(viewableRecordId)}
                            mountOnEnter
                            unmountOnExit
                          >
                            {modalElement}
                          </Slide>
                        );
                      }}
                      submitted={updated}
                      editMode={editRecord}
                      SearchSyncToolbarProps={{
                        ...modalFormProps.SearchSyncToolbarProps,
                        load: loadRecordDetails,
                        loading: loadingRecordDetails,
                        errorMessage: loadingRecordDetailsErrorMessage,
                        hasSyncTool: true,
                      }}
                      onClickEdit={() => {
                        const pathToEditRecord = (() => {
                          if (pathToEdit) {
                            return pathToEdit;
                          }
                          if (getPathToEdit && selectedRecord) {
                            return getPathToEdit(selectedRecord);
                          }
                          return addSearchParams(pathname, {
                            ...allSearchParams,
                            [editRecordSearchParamKey]: 'true',
                          });
                        })();
                        navigate(pathToEditRecord);
                      }}
                    >
                      {({ ...rest }) => {
                        if (typeof children === 'function') {
                          return children({
                            mode: editRecord ? 'edit' : 'view',
                            selectedRecord,
                            loadingState,
                            ...rest,
                          });
                        }
                        return children;
                      }}
                    </ModalForm>
                  </LoadingProvider>
                );
              })()}
            </>
          );
        }
      })()}

      {/* Delete Form */}
      {(() => {
        const loadingState = {
          loading: loadingRecordDetails,
          errorMessage: loadingRecordDetailsErrorMessage,
          load: loadRecordDetails,
          locked: true,
        };
        return (
          <LoadingProvider value={loadingState}>
            <ModalForm
              {...{
                validationSchema,
              }}
              initialValues={{ ...selectedRecord }}
              title={
                <Grid
                  container
                  sx={{
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Grid item>Delete {labelSingular}</Grid>
                  {descriptionElement}
                </Grid>
              }
              open={Boolean(
                selectedRecord && selectedRecord.id === deletableRecordId
              )}
              onSubmit={async () => {
                if (recordDeletor && selectedRecord) {
                  await _delete(selectedRecord);
                }
              }}
              onClose={() => {
                setDeletableRecordId('');
                resetDeletionState();
              }}
              CloseActionButtonProps={{
                children: 'Cancel',
              }}
              loading={deleting}
              errorMessage={deleteErrorMessage}
              submitButtonText="Delete"
              SubmitButtonProps={{
                color: 'error',
              }}
              staticEntityDetails={
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Please confirm that you want to delete this{' '}
                  {lowercaseLabelSingular}.
                </Typography>
              }
              lockSubmitIfNoChange={false}
            >
              {({ ...rest }) => {
                return (
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: palette.divider,
                    }}
                  >
                    {(() => {
                      if (typeof children === 'function') {
                        return children({
                          mode: 'view',
                          selectedRecord,
                          loadingState,
                          ...rest,
                        });
                      }
                      return children;
                    })()}
                  </Card>
                );
              }}
            </ModalForm>
          </LoadingProvider>
        );
      })()}
    </>
  );
};

export const TableCrud = forwardRef(BaseTableCrud) as <
  RecordRow extends BaseDataRow,
  InitialValues extends FormikValues
>(
  p: TableCrudProps<RecordRow, InitialValues> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default TableCrud;
