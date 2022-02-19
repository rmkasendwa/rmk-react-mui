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

export interface IKanbanBoardContext {
  lanes: ILaneProps[];
  activeCard?: ICardIdentifier | null;
  setActiveCard?: Dispatch<SetStateAction<ICardIdentifier | null>>;
  movingCard?: ICardIdentifier | null;
  setMovingCard?: Dispatch<SetStateAction<ICardIdentifier | null>>;
  moveCard?: (
    movingCard: ICardIdentifier | null | undefined,
    activeCard: ICardIdentifier | null | undefined
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
  const [activeCard, setActiveCard] = useState<ICardIdentifier | null>(null);
  const [movingCard, setMovingCard] = useState<ICardIdentifier | null>(null);
  const [lanes, setLanes] = useState<ILane[]>([]);

  const moveCard = useCallback(
    (
      movingCard: ICardIdentifier | null | undefined,
      activeCard: ICardIdentifier | null | undefined
    ) => {
      console.log({ movingCard, activeCard, activeLaneId });
      if (
        movingCard &&
        (activeCard ||
          (activeLaneId != null && movingCard.laneId !== activeLaneId))
      ) {
        const movingLane = lanes.find(({ id }) => id === movingCard.laneId);
        const activeLane = lanes.find(({ id }) => id === activeLaneId);
        if (movingLane && activeLane) {
          const movingCardIndex = movingLane.cards.findIndex(
            ({ id }) => id === movingCard.id
          );
          if (activeCard) {
            const activeCardIndex = activeLane.cards.findIndex(
              ({ id }) => id === activeCard.id
            );
            activeLane.cards.splice(
              activeCardIndex,
              0,
              ...movingLane.cards.splice(movingCardIndex, 1)
            );
          } else {
            activeLane.cards.push(
              ...movingLane.cards.splice(movingCardIndex, 1)
            );
          }
          setLanes([...lanes]);
        }
        setActiveCard && setActiveCard(null);
        setMovingCard && setMovingCard(null);
      }
    },
    [activeLaneId, lanes]
  );

  useEffect(() => {
    setLanes(propLanes);
  }, [propLanes]);

  return (
    <KanbanBoardContext.Provider
      value={{
        lanes,
        activeCard,
        setActiveCard,
        movingCard,
        setMovingCard,
        moveCard,
        activeLaneId,
        setActiveLaneId,
      }}
    >
      {children}
    </KanbanBoardContext.Provider>
  );
};
