import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';

import { isElementInteractive } from '../../utils/html';
import EllipsisMenuIconButton from '../EllipsisMenuIconButton';
import LoadingTypography from '../LoadingTypography';
import { useKanbanBoardContext } from './KanbanBoardContext';
import { Card } from './models';

export interface KanbanBoardCardClasses {
  /** Styles applied to the root element. */
  root: string;

  /** Styles applied to the selected root element */
  selected: string;
}

export type KanbanBoardCardClassKey = keyof KanbanBoardCardClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKanbanBoardCard: KanbanBoardCardProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKanbanBoardCard: keyof KanbanBoardCardClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKanbanBoardCard?: {
      defaultProps?: ComponentsProps['MuiKanbanBoardCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKanbanBoardCard'];
      variants?: ComponentsVariants['MuiKanbanBoardCard'];
    };
  }
}
//#endregion

export const getKanbanBoardCardUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiKanbanBoardCard', slot);
};

const slots: Record<KanbanBoardCardClassKey, [KanbanBoardCardClassKey]> = {
  root: ['root'],
  selected: ['selected'],
};

export const kanbanBoardCardClasses: KanbanBoardCardClasses =
  generateUtilityClasses(
    'MuiKanbanBoardCard',
    Object.keys(slots) as KanbanBoardCardClassKey[]
  );

export interface KanbanBoardCardProps extends Card {}

export const KanbanBoardCard = forwardRef<any, KanbanBoardCardProps>(
  function KanbanBoardCard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiKanbanBoardCard' });
    const {
      className,
      id,
      laneId,
      title,
      description,
      selected,
      onClick,
      sx,
      tools,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getKanbanBoardCardUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const cardElementRef = useRef<HTMLDivElement | null>(null);

    const { palette } = useTheme();
    const { onCardClick } = useKanbanBoardContext();

    return (
      <Box
        component="article"
        ref={mergeRefs([ref, cardElementRef])}
        {...rest}
        className={clsx(classes.root, selected && classes.selected)}
        sx={{
          border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
          backgroundColor: palette.background.default,
          borderRadius: 1,
          py: 1,
          px: 2,
          cursor: onCardClick ? 'pointer' : '',
          minWidth: 250,
          ...(() => {
            if (selected) {
              return {
                bgcolor: alpha(palette.primary.main, 0.3),
              };
            }
          })(),
          ...sx,
        }}
        onClick={
          onCardClick
            ? (event: any) => {
                if (!isElementInteractive(event.target as HTMLElement)) {
                  onCardClick(id, laneId);
                }
              }
            : onClick
        }
      >
        <Grid container component="header" sx={{ pb: 1, alignItems: 'center' }}>
          <Grid item xs sx={{ minWidth: 0, fontSize: 14 }}>
            {(() => {
              if (typeof title === 'string') {
                return (
                  <LoadingTypography sx={{ fontSize: 14 }} noWrap>
                    {title}
                  </LoadingTypography>
                );
              }
              return title;
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
                  >
                    <MoreHorizIcon />
                  </EllipsisMenuIconButton>
                </Grid>
              );
            }
          })()}
        </Grid>
        <Box
          component="section"
          sx={{
            color: palette.text.secondary,
            pointerEvents: 'none',
          }}
        >
          {description}
        </Box>
      </Box>
    );
  }
);

export default KanbanBoardCard;
