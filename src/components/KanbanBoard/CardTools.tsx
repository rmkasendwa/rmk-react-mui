import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  listItemIconClasses,
  listItemTextClasses,
} from '@mui/material';
import { FC, useState } from 'react';

import {
  IKanbanBoardCardTool,
  TKanbanBoardCardToolItem,
  TKanbanBoardId,
} from './KanbanBoardContext';

export interface ICardToolsProps {
  tools: TKanbanBoardCardToolItem[];
  laneId: TKanbanBoardId;
  cardId: TKanbanBoardId;
}

const CardTools: FC<ICardToolsProps> = ({ tools, cardId, laneId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const actualTools = tools.filter(
    (toolItem) => toolItem !== 'DIVIDER'
  ) as IKanbanBoardCardTool[];
  const toolsHaveIcons = actualTools.some(({ icon }) => icon);
  if (actualTools.length === 1) {
    const [tool] = actualTools.filter((toolItem) => toolItem.icon);
    if (tool) {
      const { icon, label, onClick } = tool;
      return (
        <Tooltip title={label} arrow>
          <Box
            onClick={() => {
              onClick && onClick(laneId, cardId);
            }}
            sx={{ display: 'flex', cursor: 'pointer' }}
          >
            {icon}
          </Box>
        </Tooltip>
      );
    }
  }

  return (
    <>
      <Box
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{ display: 'flex', cursor: 'pointer' }}
      >
        <MoreHorizIcon />
      </Box>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {tools.map((toolItem, index) => {
          if (toolItem === 'DIVIDER') {
            return <Divider key={index} />;
          }
          const { label, icon, onClick } = toolItem;
          if (!icon) {
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  onClick && onClick(laneId, cardId);
                  handleClose();
                }}
                sx={{
                  [`& .${listItemTextClasses.root}`]: {
                    pl: toolsHaveIcons ? `30px` : undefined,
                  },
                }}
              >
                <ListItemText inset={toolsHaveIcons}>{label}</ListItemText>
              </MenuItem>
            );
          }
          return (
            <MenuItem
              key={index}
              onClick={() => {
                onClick && onClick(laneId, cardId);
                handleClose();
              }}
              sx={{
                [`& .${listItemIconClasses.root}`]: {
                  minWidth: 30,
                },
              }}
            >
              <ListItemIcon sx={{ mr: 0 }}>{icon}</ListItemIcon>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default CardTools;
