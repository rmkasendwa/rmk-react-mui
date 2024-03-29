import ErrorIcon from '@mui/icons-material/Error';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import { alpha, darken } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef, useEffect, useRef } from 'react';
import {
  Container as BaseContainer,
  Draggable as BaseDraggable,
} from 'react-smooth-dnd';
import scrollIntoView from 'scroll-into-view-if-needed';

import EllipsisMenuIconButton from '../EllipsisMenuIconButton';
import LoadingTypography from '../LoadingTypography';
import RenderIfVisible from '../RenderIfVisible';
import Tooltip from '../Tooltip';
import KanbanBoardCard from './KanbanBoardCard';
import { useKanbanBoardContext } from './KanbanBoardContext';
import { Lane } from './models';

const Container = BaseContainer as any;
const Draggable = BaseDraggable as any;

export interface KanbanBoardLaneClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type KanbanBoardLaneClassKey = keyof KanbanBoardLaneClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKanbanBoardLane: KanbanBoardLaneProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKanbanBoardLane: keyof KanbanBoardLaneClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKanbanBoardLane?: {
      defaultProps?: ComponentsProps['MuiKanbanBoardLane'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKanbanBoardLane'];
      variants?: ComponentsVariants['MuiKanbanBoardLane'];
    };
  }
}
//#endregion

export const getKanbanBoardLaneUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiKanbanBoardLane', slot);
};

const slots: Record<KanbanBoardLaneClassKey, [KanbanBoardLaneClassKey]> = {
  root: ['root'],
};

export const kanbanBoardLaneClasses: KanbanBoardLaneClasses =
  generateUtilityClasses(
    'MuiKanbanBoardLane',
    Object.keys(slots) as KanbanBoardLaneClassKey[]
  );

export interface KanbanBoardLaneProps extends Lane {}

export const KanbanBoardLane = forwardRef<any, KanbanBoardLaneProps>(
  function KanbanBoardLane(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiKanbanBoardLane' });
    const {
      className,
      id,
      title,
      showCardCount = false,
      loading = false,
      cards,
      errorMessage,
      sx,
      footer,
      tools,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getKanbanBoardLaneUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const laneContentContainerRef = useRef<HTMLDivElement | null>(null);

    const { palette } = useTheme();
    const {
      setToLaneId,
      onCardDrop,
      setFromLaneId,
      fromLaneId,
      toLaneId,
      onCardMoveAcrossLanes,
    } = useKanbanBoardContext();

    useEffect(() => {
      const selectedCardIndex = cards.findIndex(({ selected }) => selected);
      const containerElement = laneContentContainerRef.current?.querySelector(
        '.smooth-dnd-container'
      );
      if (
        selectedCardIndex >= 0 &&
        containerElement &&
        containerElement.childNodes[selectedCardIndex]
      ) {
        scrollIntoView(
          containerElement.childNodes[selectedCardIndex] as HTMLElement,
          {
            scrollMode: 'if-needed',
            block: 'nearest',
            inline: 'nearest',
            behavior: 'smooth',
          }
        );
      }
    }, [cards]);

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          height: '100%',
          display: 'inline-block',
          verticalAlign: 'top',
          whiteSpace: 'normal',
        }}
      >
        <Box
          ref={laneContentContainerRef}
          component="section"
          sx={{
            bgcolor: darken(
              palette.background.default,
              palette.mode === 'dark' ? 0.9 : 0.1
            ),
            border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '& .smooth-dnd-container': {
              flex: 1,
              px: 1,
              width: 360,
              overflow: 'hidden auto',
              alignSelf: 'center',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
            [`
            & .smooth-dnd-container>.smooth-dnd-draggable-wrapper,
            & .undraggable-wrapper
          `]: {
              mb: 1,
            },
            ...sx,
          }}
        >
          <Box component="header" className="column-drag-handle" sx={{ p: 1 }}>
            <Grid container spacing={1} alignItems="center">
              {showCardCount && cards.length > 0 ? (
                <Grid item display="flex">
                  <Badge
                    badgeContent={cards.length}
                    color="primary"
                    max={999}
                    sx={{
                      '&>.MuiBadge-badge': {
                        position: 'relative',
                        transform: 'none',
                      },
                    }}
                  />{' '}
                </Grid>
              ) : null}
              <Grid
                item
                xs
                sx={{ minWidth: 0, fontWeight: 'bold', fontSize: 15 }}
              >
                {(() => {
                  if (typeof title === 'string') {
                    return (
                      <LoadingTypography
                        sx={{ fontWeight: 'bold', fontSize: 15 }}
                        noWrap
                      >
                        {title}
                      </LoadingTypography>
                    );
                  }
                  return <>{title}</>;
                })()}
              </Grid>
              {(() => {
                if (tools) {
                  return (
                    <Grid item display="flex">
                      <EllipsisMenuIconButton
                        options={tools}
                        sx={{
                          p: 0,
                        }}
                      />
                    </Grid>
                  );
                }
              })()}
              {(() => {
                if (errorMessage) {
                  return (
                    <Grid item display="flex">
                      <Tooltip title={errorMessage} arrow>
                        <ErrorIcon color="error" />
                      </Tooltip>
                    </Grid>
                  );
                }
                if (loading) {
                  return (
                    <Grid item display="flex">
                      <CircularProgress size={16} color="inherit" />
                    </Grid>
                  );
                }
              })()}
            </Grid>
          </Box>
          <Container
            groupName="col"
            onDrop={({ addedIndex, removedIndex, payload }: any) => {
              onCardDrop &&
                onCardDrop(id, { addedIndex, removedIndex, payload });
            }}
            getChildPayload={(index: any) => cards[index]}
            dragClass="card-ghost"
            dropClass="card-ghost-drop"
            onDragEnd={({ isSource, payload }: any) => {
              if (isSource) {
                onCardMoveAcrossLanes &&
                  fromLaneId != null &&
                  toLaneId != null &&
                  onCardMoveAcrossLanes(fromLaneId, toLaneId, payload.id);
              }
            }}
            onDragEnter={() => {
              setToLaneId && setToLaneId(id);
            }}
            onDragStart={({ isSource }: any) => {
              if (isSource && setFromLaneId) {
                setFromLaneId(id);
              }
            }}
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: 'drop-preview',
            }}
            animationDuration={200}
          >
            {cards.map(({ id: cardId, draggable = true, sx, ...rest }) => {
              const cardStyles: any = {};
              if (!draggable) {
                cardStyles.bgcolor = alpha(palette.background.paper, 0.6);
                cardStyles.userSelect = 'none';
              }
              const card = (
                <RenderIfVisible
                  unWrapChildrenIfVisible
                  stayRendered
                  displayPlaceholder={false}
                  sx={{
                    height: 300,
                  }}
                >
                  <KanbanBoardCard
                    {...{ id: cardId, ...rest }}
                    sx={{
                      ...cardStyles,
                      ...sx,
                    }}
                    laneId={id}
                  />
                </RenderIfVisible>
              );
              if (!draggable) {
                return (
                  <Box key={cardId} className="undraggable-wrapper">
                    {card}
                  </Box>
                );
              }
              return <Draggable key={cardId}>{card}</Draggable>;
            })}
          </Container>
          {footer && (
            <Box
              component="footer"
              className="column-drag-handle"
              sx={{
                borderTop: `1px solid ${alpha(palette.text.primary, 0.2)}`,
                height: 40,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

export default KanbanBoardLane;
