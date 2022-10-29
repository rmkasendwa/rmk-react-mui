import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { FC, useContext } from 'react';

import CardTools from './CardTools';
import { Card as CardType, KanbanBoardContext } from './KanbanBoardContext';

export interface CardProps extends CardType {}

const Card: FC<CardProps> = ({
  id,
  laneId,
  title,
  description,
  sx,
  tools,
  ...rest
}) => {
  const { palette } = useTheme();
  const { onCardClick } = useContext(KanbanBoardContext);

  return (
    <Box
      component="article"
      {...rest}
      className="kanban-board-card"
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
                <CardTools tools={tools} cardId={id} laneId={laneId} />
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
};

export default Card;
