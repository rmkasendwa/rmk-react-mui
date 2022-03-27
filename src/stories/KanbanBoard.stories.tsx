import { Chip, Grid, Typography } from '@mui/material';
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
    draggable: laneIndex % 2 === 0,
    cards: Array.from({ length: Math.round(Math.random() * 20) }).map(
      (_, cardIndex) => {
        return {
          id: `${laneIndex}${cardIndex}`,
          laneId: laneIndex,
          title: `${cardIndex + 1}. ${lorem.generateWords(5)}`,
          description: lorem.generateWords(40),
          draggable: cardIndex % 2 === 0,
        };
      }
    ),
    footer: (
      <Grid container p={1}>
        <Grid item>
          <Typography variant="body2">
            Footer{' '}
            <Chip
              label={lorem.generateWords(1)}
              size="small"
              variant="outlined"
              component="span"
            />
          </Typography>
        </Grid>
        <Grid item xs />
        <Grid item>
          <Typography variant="body2" color="primary">
            Manage
          </Typography>
        </Grid>
      </Grid>
    ),
  };
});

const Template: ComponentStory<typeof KanbanBoard> = (props) => {
  return <KanbanBoard lanes={lanes} showCardCount {...props} />;
};

export const Default = Template.bind({});
