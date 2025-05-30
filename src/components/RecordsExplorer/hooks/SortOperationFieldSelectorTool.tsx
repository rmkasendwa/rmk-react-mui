import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CloseIcon from '@mui/icons-material/Close';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import {
  Box,
  Button,
  ClickAwayListener,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Grow,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
  useThemeProps,
} from '@mui/material';
import { omit } from 'lodash';
import { FC, Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDragLayer, useDrop } from 'react-dnd';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend';

import { PopupToolProps, usePopupTool } from '../../../hooks/Tools/PopupTool';
import {
  OnSelectSortOption,
  SelectedSortOption,
  SortDirection,
  SortOption,
  SortableFields,
} from '../../../models/Sort';
import SortIcon from '../../Icons/SortIcon';
import DataDropdownField from '../../InputFields/DataDropdownField';
import PaginatedDropdownOptionList, {
  PaginatedDropdownOptionListProps,
} from '../../PaginatedDropdownOptionList';
import { BaseDataRow } from '../../Table';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSortOperationFieldSelectorTool: SortOperationFieldSelectorToolProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiSortOperationFieldSelectorTool?: {
      defaultProps?: ComponentsProps['MuiSortOperationFieldSelectorTool'];
      variants?: ComponentsVariants['MuiSortOperationFieldSelectorTool'];
    };
  }
}
//#endregion

const itemTypes = {
  LIST_ITEM: 'listItem',
};

const SortFieldDragLayer: FC = () => {
  const { itemType, isDragging, item, delta } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    delta: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || itemType !== itemTypes.LIST_ITEM || !item) {
    return null;
  }

  const { children, elementOffsetTop } = item;

  return (
    <Box
      sx={{
        height: 0,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          py: 0.5,
          px: 1,
          ...(() => {
            if (!delta) {
              return {
                display: 'none',
              };
            }
            return {
              position: 'absolute',
              top: elementOffsetTop,
              transform: `translateY(${delta.y}px)`,
            };
          })(),
          pointerEvents: 'none',
        }}
      >
        <Grid
          container
          columnSpacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          {children}
          <Grid item>
            <Box
              sx={{
                display: 'flex',
              }}
            >
              <DragHandleIcon />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

const DraggableSortedField: FC<{
  id: string;
  moveSortedField: (draggedId: string, id: string) => void;
  commitSortedFieldMovement: () => void;
  children: ReactNode;
}> = ({ id, moveSortedField, commitSortedFieldMovement, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragHandleElementRef = useRef<HTMLDivElement | null>(null);

  const [{ handlerId, isDragging }, connectDrag, connectPreview] = useDrag({
    type: itemTypes.LIST_ITEM,
    item: { id, children, elementOffsetTop: ref.current?.offsetTop },
    collect: (monitor) => {
      return {
        handlerId: monitor.getHandlerId(),
        isDragging: monitor.isDragging(),
      };
    },
  });

  const [, connectDrop] = useDrop({
    accept: itemTypes.LIST_ITEM,
    hover: ({ id: draggedId }: { id: string; type: string }) => {
      if (draggedId !== id) {
        moveSortedField(draggedId, id);
      }
    },
    drop: () => {
      commitSortedFieldMovement();
    },
  });

  useEffect(() => {
    connectPreview(getEmptyImage(), { captureDraggingState: true });
  }, [connectPreview]);

  connectDrag(dragHandleElementRef);
  connectDrop(ref);

  return (
    <Grid
      ref={ref}
      container
      columnSpacing={1}
      data-handler-id={handlerId}
      sx={{ alignItems: 'center', py: 0.5, opacity: isDragging ? 0 : 1 }}
    >
      {children}
      <Grid item>
        <Box
          ref={dragHandleElementRef}
          sx={{
            display: 'flex',
            cursor: 'grab',
          }}
        >
          <DragHandleIcon />
        </Box>
      </Grid>
    </Grid>
  );
};

const DraggableSortedFieldsContainer = <RecordRow extends BaseDataRow>({
  sortLabel,
  sortableFields,
  selectedSortParams: selectedSortParamsProp,
  unselectedSortableFields,
  onChangeSelectedSortParams,
}: {
  sortLabel: string;
  sortableFields: SortableFields<RecordRow>;
  selectedSortParams: SelectedSortOption<RecordRow>[];
  unselectedSortableFields: SortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}) => {
  const [selectedSortParams, setSelectedSortParams] = useState(() => {
    return selectedSortParamsProp;
  });

  useEffect(() => {
    setSelectedSortParams((prevSelectedSortParams) => {
      if (
        selectedSortParamsProp.map(({ id }) => id).join(',') !==
        prevSelectedSortParams.map(({ id }) => id).join(',')
      ) {
        return selectedSortParamsProp;
      }
      return prevSelectedSortParams;
    });
  }, [selectedSortParamsProp]);

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {selectedSortParams.map(
        ({ id, label, type = 'string', sortLabels, sortDirection }, index) => {
          return (
            <DraggableSortedField
              key={String(id)}
              id={String(id)}
              moveSortedField={(draggedId: string, hoveredId: string): void => {
                const draggedIndex = selectedSortParams.findIndex(({ id }) => {
                  return id === draggedId;
                });
                const hoveredIndex = selectedSortParams.findIndex(({ id }) => {
                  return id === hoveredId;
                });
                const draggedItem = selectedSortParams[draggedIndex];

                const nextSelectedSortParams = [...selectedSortParams];
                nextSelectedSortParams.splice(draggedIndex, 1);
                nextSelectedSortParams.splice(hoveredIndex, 0, draggedItem);
                setSelectedSortParams(nextSelectedSortParams);
              }}
              commitSortedFieldMovement={() => {
                onChangeSelectedSortParams(selectedSortParams);
              }}
            >
              <Grid
                item
                sx={{
                  width: 70,
                }}
              >
                <Typography variant="body2" align="right" noWrap>
                  {index > 0 ? 'Then' : sortLabel} by
                </Typography>
              </Grid>
              <Grid item xs>
                <DataDropdownField
                  value={String(id)}
                  onChange={(event) => {
                    const value = event.target.value;
                    const fieldSelectedSortParam = sortableFields.find(
                      ({ id }) => id === value
                    );
                    if (fieldSelectedSortParam && index !== -1) {
                      const nextSortParams = [...selectedSortParams];
                      nextSortParams[index] = {
                        ...fieldSelectedSortParam,
                        sortDirection,
                      };
                      onChangeSelectedSortParams([...nextSortParams]);
                    }
                  }}
                  options={[
                    {
                      label,
                      value: String(id),
                    },
                    ...unselectedSortableFields.map(({ id, label }) => {
                      return {
                        label,
                        value: String(id),
                      };
                    }),
                  ]}
                  showClearButton={false}
                  size="small"
                />
              </Grid>
              <Grid item>
                <Stack direction="row">
                  {(
                    [
                      {
                        sortDirection: 'ASC',
                      },
                      {
                        sortDirection: 'DESC',
                      },
                    ] as {
                      sortDirection: SortDirection;
                    }[]
                  ).map(({ sortDirection: baseSortDirection }) => {
                    return (
                      <Button
                        key={baseSortDirection}
                        color={
                          sortDirection === baseSortDirection
                            ? 'primary'
                            : 'inherit'
                        }
                        onClick={() => {
                          const selectedSortParam = selectedSortParams.find(
                            ({ id: currentId }) => currentId === id
                          );
                          if (selectedSortParam) {
                            selectedSortParam.sortDirection = baseSortDirection;
                            onChangeSelectedSortParams([...selectedSortParams]);
                          }
                        }}
                        variant={
                          sortDirection === baseSortDirection
                            ? 'contained'
                            : 'text'
                        }
                      >
                        {(() => {
                          const sorts = (() => {
                            if (sortLabels) {
                              return [...sortLabels];
                            }
                            switch (type) {
                              case 'number':
                              case 'date':
                                return [0, 9];
                              case 'boolean':
                                return ['T', 'F'];
                              case 'string':
                              default:
                                return ['A', 'Z'];
                            }
                          })();

                          const [a, b] =
                            baseSortDirection === 'ASC'
                              ? sorts
                              : sorts.reverse();

                          return (
                            <>
                              {a} <ArrowRightAltIcon /> {b}
                            </>
                          );
                        })()}
                      </Button>
                    );
                  })}
                </Stack>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => {
                    const selectedSortParamIndex = selectedSortParams.findIndex(
                      ({ id: currentId }) => currentId === id
                    );
                    if (selectedSortParamIndex !== -1) {
                      selectedSortParams.splice(selectedSortParamIndex, 1);
                      onChangeSelectedSortParams([...selectedSortParams]);
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </DraggableSortedField>
          );
        }
      )}
      <SortFieldDragLayer />
    </Box>
  );
};

//#region Sort Field Selector
export interface SortFieldSelectorProps<RecordRow extends BaseDataRow = any>
  extends Partial<PopupToolProps> {
  sortableFields: SortableFields<RecordRow>;
  addFieldText?: string;
  sortLabel?: string;
  selectedSortParams: SelectedSortOption<RecordRow>[];
  onChangeSelectedSortParams: (
    selectedSortParams: SelectedSortOption<RecordRow>[]
  ) => void;
}

export const SortFieldSelector: FC<SortFieldSelectorProps> = ({
  sortableFields,
  addFieldText,
  sortLabel = 'Sort',
  selectedSortParams,
  onChangeSelectedSortParams,
}) => {
  const unselectedSortableFieldsAnchorRef = useRef<HTMLButtonElement | null>(
    null
  );
  const sortableFieldsRef = useRef(sortableFields);
  sortableFieldsRef.current = sortableFields;

  const [openUnselectedSortableFields, setOpenUnselectedSortableFields] =
    useState(false);

  const unselectedSortableFields = (() => {
    const selectedSortParamIds = selectedSortParams.map(({ id }) => id);
    return sortableFields.filter(({ id }) => {
      return !selectedSortParamIds.includes(id);
    });
  })();

  const paginatedDropdownOptionsListProps: PaginatedDropdownOptionListProps = {
    searchable: unselectedSortableFields.length > 5,
    options: unselectedSortableFields.map(({ id, label, searchableLabel }) => {
      return {
        label,
        searchableLabel,
        value: String(id),
      };
    }),
    onChangeSelectedOptions: (selectedOptions) => {
      const selectedSortParam = unselectedSortableFields.find(
        ({ id }) => id === selectedOptions[0].value
      );
      if (selectedSortParam) {
        onChangeSelectedSortParams([
          ...selectedSortParams,
          {
            ...selectedSortParam,
            sortDirection: selectedSortParam.sortDirection || 'ASC',
          },
        ]);
      }
      setOpenUnselectedSortableFields(false);
    },
  };
  if (selectedSortParams.length > 0) {
    return (
      <DndProvider backend={HTML5Backend}>
        <DraggableSortedFieldsContainer
          {...{
            sortLabel,
            selectedSortParams,
            onChangeSelectedSortParams,
            sortableFields,
            unselectedSortableFields,
          }}
        />
        {unselectedSortableFields.length > 0 ? (
          <>
            <Button
              startIcon={<AddIcon />}
              endIcon={<ArrowDropDownIcon />}
              ref={unselectedSortableFieldsAnchorRef}
              color="inherit"
              onClick={() => {
                setOpenUnselectedSortableFields(true);
              }}
            >
              {addFieldText}
            </Button>
            <Popper
              open={openUnselectedSortableFields}
              anchorEl={unselectedSortableFieldsAnchorRef.current}
              transition
              placement="bottom-start"
              sx={{
                zIndex: 9999,
              }}
            >
              {({ TransitionProps }) => {
                return (
                  <Grow {...TransitionProps}>
                    <Box>
                      <ClickAwayListener
                        onClickAway={() => {
                          setOpenUnselectedSortableFields(false);
                        }}
                      >
                        <Box>
                          <PaginatedDropdownOptionList
                            {...paginatedDropdownOptionsListProps}
                          />
                        </Box>
                      </ClickAwayListener>
                    </Box>
                  </Grow>
                );
              }}
            </Popper>
          </>
        ) : null}
      </DndProvider>
    );
  }
  return (
    <PaginatedDropdownOptionList
      {...paginatedDropdownOptionsListProps}
      variant="elevation"
      elevation={0}
      sx={{
        border: 'none',
        mx: -2,
        my: -1,
      }}
    />
  );
};
//#endregion

//#region SortOperationFieldSelectorTool
export interface SortOperationFieldSelectorToolProps<
  RecordRow extends BaseDataRow = any,
> extends SortFieldSelectorProps<RecordRow> {
  title?: string;
  onSelectSortOption?: OnSelectSortOption<RecordRow>;
}

export const useSortOperationFieldSelectorTool = <
  RecordRow extends BaseDataRow,
>(
  inProps: SortOperationFieldSelectorToolProps<RecordRow>
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiSortOperationFieldSelectorTool',
  });
  const {
    sortableFields,
    addFieldText = 'Add another sort',
    footerContent,
    icon = <SortIcon />,
    sortLabel = 'Sort',
    selectedSortParams,
    onChangeSelectedSortParams,
    ...rest
  } = omit(props, 'title');

  let { title } = props;
  title || (title = sortLabel);

  const hasSortParams = selectedSortParams.length > 0;

  const tool = usePopupTool({
    ...rest,
    label: hasSortParams
      ? (() => {
          if (selectedSortParams.length === 1) {
            return `${sortLabel}ed by ${selectedSortParams[0].label}`;
          }
          return `${sortLabel}ed by ${selectedSortParams.length} fields`;
        })()
      : sortLabel,
    title: hasSortParams
      ? (() => {
          const sortedByFields = [...selectedSortParams];
          const firstSortedByField = sortedByFields.shift();
          const title = [
            <Fragment key={0}>
              {sortLabel}ed by{' '}
              <strong>
                {firstSortedByField?.label}{' '}
                {firstSortedByField?.sortDirection === 'DESC'
                  ? 'Descending'
                  : 'Ascending'}
              </strong>
            </Fragment>,
          ];
          sortedByFields.forEach(({ label, sortDirection }, index) => {
            title.push(
              <Fragment key={index + 1}>
                {' '}
                then by{' '}
                <strong>
                  {label}{' '}
                  {sortDirection === 'DESC' ? 'Descending' : 'Ascending'}
                </strong>
              </Fragment>
            );
          });
          return title;
        })()
      : `Not ${sortLabel}ed`,
    popupCardTitle: (
      <Grid
        container
        sx={{
          alignItems: 'center',
          py: 1,
          px: 2,
        }}
      >
        <Grid item xs>
          <Typography
            variant="body2"
            component="h2"
            sx={{
              fontWeight: 'bold',
            }}
          >
            {title}
          </Typography>
        </Grid>
        {selectedSortParams.length > 0 ? (
          <Grid item>
            <Button
              color="inherit"
              onClick={(event) => {
                event.stopPropagation();
                onChangeSelectedSortParams([]);
              }}
            >
              Clear
            </Button>
          </Grid>
        ) : null}
      </Grid>
    ),
    bodyContent: (
      <SortFieldSelector
        {...{
          sortLabel,
          title,
          addFieldText,
          sortableFields,
          selectedSortParams,
          onChangeSelectedSortParams,
        }}
      />
    ),
    icon,
    footerContent,
    variant: hasSortParams ? 'contained' : 'text',
  });

  return omit(tool, 'open', 'setOpen');
};
//#endregion
