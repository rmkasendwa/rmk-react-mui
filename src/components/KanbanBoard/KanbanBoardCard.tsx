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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef } from 'react';

import EllipsisMenuIconButton from '../EllipsisMenuIconButton';
import { useKanbanBoardContext } from './KanbanBoardContext';
import { Card } from './models';

export interface KanbanBoardCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type KanbanBoardCardClassKey = keyof KanbanBoardCardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKanbanBoardCard: KanbanBoardCardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKanbanBoardCard: keyof KanbanBoardCardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKanbanBoardCard?: {
      defaultProps?: ComponentsProps['MuiKanbanBoardCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKanbanBoardCard'];
      variants?: ComponentsVariants['MuiKanbanBoardCard'];
    };
  }
}

export interface KanbanBoardCardProps extends Card {}

export function getKanbanBoardCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuiKanbanBoardCard', slot);
}

export const kanbanBoardCardClasses: KanbanBoardCardClasses =
  generateUtilityClasses('MuiKanbanBoardCard', ['root']);

const slots = {
  root: ['root'],
};

export const KanbanBoardCard = forwardRef<any, KanbanBoardCardProps>(
  function KanbanBoardCard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiKanbanBoardCard' });
    const { className, id, laneId, title, description, sx, tools, ...rest } =
      props;

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

    const { palette } = useTheme();
    const { onCardClick } = useKanbanBoardContext();

    return (
      <Box
        component="article"
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          border: `1px solid ${alpha(palette.text.primary, 0.2)}`,
          backgroundColor: palette.background.default,
          borderRadius: 1,
          py: 1,
          px: 2,
          cursor: onCardClick ? 'pointer' : '',
          minWidth: 250,
          ...sx,
        }}
        onClick={
          onCardClick
            ? (event: any) => {
                if (
                  (event.target as HTMLElement)?.classList.contains(
                    'kanban-board-card'
                  )
                ) {
                  onCardClick(id, laneId);
                }
              }
            : undefined
        }
      >
        <Grid container component="header" sx={{ pb: 1, alignItems: 'center' }}>
          <Grid item xs sx={{ minWidth: 0, fontSize: 14 }}>
            {(() => {
              if (typeof title === 'string') {
                return (
                  <Tooltip title={title}>
                    <Typography sx={{ fontSize: 14 }} noWrap>
                      {title}
                    </Typography>
                  </Tooltip>
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
