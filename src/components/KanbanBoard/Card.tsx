import { Box, Grid, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { FC, useContext } from 'react';

import CardTools from './CardTools';
import { ICard, KanbanBoardContext } from './KanbanBoardContext';

export interface ICardProps extends ICard {}

const Card: FC<ICardProps> = ({
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
      onClick={onCardClick ? () => onCardClick(id, laneId) : undefined}
    >
      <Grid container component="header" sx={{ pb: 1, alignItems: 'center' }}>
        <Grid item xs minWidth={0}>
          <Tooltip title={<>{title}</>}>
            <Typography sx={{ fontSize: 14 }} noWrap>
              {title}
            </Typography>
          </Tooltip>
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
        }}
      >
        {description}
      </Box>
    </Box>
  );
};

export default Card;
