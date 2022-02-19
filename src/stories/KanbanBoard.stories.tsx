import { ComponentMeta, ComponentStory } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';

import { KanbanBoard } from '../components';

export default {
  title: 'Components/KanbanBoard',
  component: KanbanBoard,
} as ComponentMeta<typeof KanbanBoard>;

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const lanes = Array.from({ length: 6 }).map((_, laneIndex) => {
  return {
    id: laneIndex,
    title: lorem.generateWords(3),
    showCardCount: true,
    cards: Array.from({ length: Math.round(Math.random() * 20) }).map(
      (_, cardIndex) => {
        return {
          id: `${laneIndex}${cardIndex}`,
          laneId: laneIndex,
          title: `${cardIndex + 1}. ${lorem.generateWords(5)}`,
          description: lorem.generateWords(40),
        };
      }
    ),
  };
});

const Template: ComponentStory<typeof KanbanBoard> = ({}) => {
  return <KanbanBoard lanes={lanes} />;
};

export const Default = Template.bind({});
