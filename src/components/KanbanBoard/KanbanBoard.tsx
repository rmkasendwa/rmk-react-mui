import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { KanbanBoardProvider } from './KanbanBoardContext';
import KanbanBoardDragAndDropContainer, {
  KanbanBoardDragAndDropContainerProps,
} from './KanbanBoardDragAndDropContainer';
import { CardClickHandler, CardMoveAcrossLanesHandler, Lane } from './models';

export interface KanbanBoardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type KanbanBoardClassKey = keyof KanbanBoardClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiKanbanBoard: KanbanBoardProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiKanbanBoard: keyof KanbanBoardClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiKanbanBoard?: {
      defaultProps?: ComponentsProps['MuiKanbanBoard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiKanbanBoard'];
      variants?: ComponentsVariants['MuiKanbanBoard'];
    };
  }
}
//#endregion

export const getKanbanBoardUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiKanbanBoard', slot);
};

const slots: Record<KanbanBoardClassKey, [KanbanBoardClassKey]> = {
  root: ['root'],
};

export const kanbanBoardClasses: KanbanBoardClasses = generateUtilityClasses(
  'MuiKanbanBoard',
  Object.keys(slots) as KanbanBoardClassKey[]
);

export interface KanbanBoardProps extends KanbanBoardDragAndDropContainerProps {
  lanes: Lane[];
  onCardClick?: CardClickHandler;
  onCardMoveAcrossLanes?: CardMoveAcrossLanesHandler;
}

export const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(
  function KanbanBoard(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiKanbanBoard' });
    const { className, lanes, onCardClick, onCardMoveAcrossLanes, ...rest } =
      props;

    const classes = composeClasses(
      slots,
      getKanbanBoardUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <KanbanBoardProvider
        {...{
          lanes,
          onCardClick,
          onCardMoveAcrossLanes,
        }}
      >
        <KanbanBoardDragAndDropContainer
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
        />
      </KanbanBoardProvider>
    );
  }
);

export default KanbanBoard;
