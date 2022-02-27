import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { ILaneProps } from './Lane';

export interface ICardIdentifier {
  id: string | number;
  laneId: string | number;
}

export interface ICard extends ICardIdentifier {
  title: ReactNode;
  description: ReactNode;
}

export interface ILane {
  id: string | number;
  title: ReactNode;
  cards: ICard[];
  showCardCount?: boolean;
}

export interface IDropResult {
  addedIndex?: number | null;
  removedIndex?: number | null;
  payload?: any;
}

export interface IKanbanBoardContext {
  lanes: ILaneProps[];
  moveCard?: (
    laneId: string | number | null,
    { addedIndex, removedIndex }: IDropResult
  ) => void;
  activeLaneId?: string | number | null;
  setActiveLaneId?: Dispatch<SetStateAction<string | number | null>>;
}
export const KanbanBoardContext = createContext<IKanbanBoardContext>({
  lanes: [],
});

export interface IKanbanBoardProviderProps {
  value: {
    lanes: ILane[];
  };
}

export const KanbanBoardProvider: FC<IKanbanBoardProviderProps> = ({
  children,
  value: { lanes: propLanes },
}) => {
  const [activeLaneId, setActiveLaneId] = useState<string | number | null>(
    null
  );
  const [lanes, setLanes] = useState<ILane[]>([]);

  const moveCard = useCallback(
    (
      laneId: string | number | null,
      { addedIndex, removedIndex, payload }: IDropResult
    ) => {
      if (laneId != null && (removedIndex != null || addedIndex != null)) {
        const lane = lanes.find((lane) => lane.id === laneId);
        if (lane) {
          const laneIndex = lanes.indexOf(lane);
          const newLane = { ...lane };
          if (removedIndex != null) {
            payload = newLane.cards.splice(removedIndex, 1)[0];
          }
          if (addedIndex != null) {
            newLane.cards.splice(addedIndex, 0, payload);
          }
          lanes.splice(laneIndex, 1, newLane);
          setLanes([...lanes]);
        }
      }
    },
    [lanes]
  );

  useEffect(() => {
    setLanes(propLanes);
  }, [propLanes]);

  return (
    <KanbanBoardContext.Provider
      value={{
        lanes,
        moveCard,
        activeLaneId,
        setActiveLaneId,
      }}
    >
      {children}
    </KanbanBoardContext.Provider>
  );
};
