import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import ArchiveIcon from '@mui/icons-material/Archive';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Meta, StoryFn } from '@storybook/react';
import { LoremIpsum } from 'lorem-ipsum';
import React from 'react';

import KanbanBoard from '../components/KanbanBoard';
import { KanbanBoardLaneProps } from '../components/KanbanBoard/KanbanBoardLane';

export default {
  title: 'Components/Kanban Board',
  component: KanbanBoard,
} as Meta<typeof KanbanBoard>;

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

const BASE_LANES = Array.from({ length: 6 }).map((_, laneIndex) => {
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
          description: (
            <>
              <Typography>{lorem.generateWords(40)}</Typography>
              <Typography sx={{ pointerEvents: 'auto' }}>
                {lorem.generateWords(10)}
              </Typography>
            </>
          ),
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
  } as KanbanBoardLaneProps;
});

const Template: StoryFn<typeof KanbanBoard> = (props) => {
  return <KanbanBoard showCardCount {...props} />;
};

export const Default = Template.bind({});
Default.args = { lanes: BASE_LANES };

export const WithLaneTools = Template.bind({});
WithLaneTools.args = {
  lanes: BASE_LANES.map(({ ...laneProps }, index) => {
    laneProps.draggable = true;
    switch (index % 4) {
      case 0:
        return {
          ...laneProps,
          tools: [
            {
              icon: <AllInboxIcon />,
              label: 'One Tool With Icon',
              onClick: (event) => {
                console.log({ event });
              },
            },
          ],
        };
      case 1:
        return {
          ...laneProps,
          tools: [
            {
              label: 'One Tool Without Icon',
              onClick: (event) => {
                console.log({ event });
              },
            },
          ],
        };
      case 2:
        return {
          ...laneProps,
          tools: [
            { label: 'Edit column' },
            { label: 'Manage automation' },
            { label: 'Archive all cards' },
            { label: 'Copy column link' },
            { label: 'Delete column' },
          ],
        };
      case 3:
        return {
          ...laneProps,
          tools: [
            { label: 'Edit column', icon: <EditIcon /> },
            { label: 'Manage automation' },
            { label: 'Archive all cards', icon: <ArchiveIcon /> },
            { label: 'Copy column link' },
            { label: 'Delete column' },
          ],
        };
    }
    return {
      ...laneProps,
      tools: [
        {
          icon: <AccountTreeIcon />,
          label: 'Tool With Icon',
          onClick: (event) => {
            console.log({ event });
          },
        },
        {
          label: 'Tool With Just Label',
          onClick: (event) => {
            console.log({ event });
          },
        },
      ],
    };
  }),
};

export const WithCardTools = Template.bind({});
WithCardTools.args = {
  lanes: BASE_LANES.map(({ cards: baseCards, ...laneProps }, laneIndex) => {
    laneProps.draggable = true;
    return {
      ...laneProps,
      cards: baseCards.map(({ ...cardProps }, index) => {
        cardProps.draggable = true;
        switch ((laneIndex + index) % 4) {
          case 0:
            return {
              ...cardProps,
              tools: [
                {
                  icon: <AllInboxIcon />,
                  label: 'One Tool With Icon',
                  onClick: (event) => {
                    console.log({ event });
                  },
                },
              ],
            };
          case 1:
            return {
              ...cardProps,
              tools: [
                {
                  label: 'One Tool Without Icon',
                  onClick: (event) => {
                    console.log({ event });
                  },
                },
              ],
            };
          case 2:
            return {
              ...cardProps,
              tools: [
                { label: 'Edit card' },
                { label: 'Archive card' },
                { label: 'Copy card link' },
                { label: 'Delete card' },
              ],
            };
          case 3:
            return {
              ...cardProps,
              tools: [
                { label: 'Edit card', icon: <EditIcon /> },
                { label: 'Archive card', icon: <ArchiveIcon /> },
                { label: 'Copy card link' },
                { label: 'Delete card' },
              ],
            };
        }
        return {
          ...cardProps,
          tools: [
            {
              icon: <AllInboxIcon />,
              label: 'One Tool With Icon',
            },
          ],
        };
      }),
    };
  }),
};

export const StressTest = Template.bind({});
StressTest.args = {
  lanes: Array.from({ length: 6 }).map((_, laneIndex) => {
    return {
      id: laneIndex,
      title: lorem.generateWords(3),
      showCardCount: true,
      draggable: laneIndex % 2 === 0,
      cards: Array.from({ length: Math.round(Math.random() * 500) }).map(
        (_, cardIndex) => {
          return {
            id: `${laneIndex}${cardIndex}`,
            laneId: laneIndex,
            title: `${cardIndex + 1}. ${lorem.generateWords(5)}`,
            description: (
              <>
                <Typography>{lorem.generateWords(40)}</Typography>
                <Typography sx={{ pointerEvents: 'auto' }}>
                  {lorem.generateWords(10)}
                </Typography>
              </>
            ),
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
    } as KanbanBoardLaneProps;
  }),
};
