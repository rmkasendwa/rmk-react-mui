import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

import { DropdownOption } from '../PaginatedDropdownOptionList';

export type KanbanBoardId = string | number;

export interface CardIdentifier {
  id: KanbanBoardId;
  laneId: KanbanBoardId;
}

export interface Card extends CardIdentifier, Omit<BoxProps, 'title' | 'id'> {
  title: ReactNode;
  description: ReactNode;
  tools?: DropdownOption[];
  draggable?: boolean;
  selected?: boolean;
}

export interface Lane extends Omit<BoxProps, 'title' | 'id'> {
  id: KanbanBoardId;
  title: ReactNode;
  cards: Card[];
  showCardCount?: boolean;
  loading?: boolean;
  errorMessage?: string;
  footer?: ReactNode;
  draggable?: boolean;
  tools?: DropdownOption[];
}

export interface DropResult {
  addedIndex?: number | null;
  removedIndex?: number | null;
  payload?: any;
}

export type CardClickHandler = (
  cardId: KanbanBoardId,
  laneId: KanbanBoardId
) => void;

export type CardMoveAcrossLanesHandler = (
  fromLaneId: KanbanBoardId,
  toLaneId: KanbanBoardId,
  cardId: KanbanBoardId
) => void;
