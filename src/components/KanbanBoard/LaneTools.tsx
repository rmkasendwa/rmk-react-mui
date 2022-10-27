import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { FC, useState } from 'react';

import {
  KanbanBoardId,
  KanbanBoardLaneTool,
  KanbanBoardLaneToolItem,
} from './KanbanBoardContext';

export interface LaneToolsProps {
  tools: KanbanBoardLaneToolItem[];
  laneId: KanbanBoardId;
}

const LaneTools: FC<LaneToolsProps> = ({ tools, laneId }) => {
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
  ) as KanbanBoardLaneTool[];
  const toolsHaveIcons = actualTools.some(({ icon }) => icon);
  if (actualTools.length === 1) {
    const [tool] = actualTools.filter((toolItem) => toolItem.icon);
    if (tool) {
      const { icon, label, onClick } = tool;
      return (
        <Tooltip title={label} arrow>
          <Box
            onClick={() => {
              onClick && onClick(laneId);
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
                  onClick && onClick(laneId);
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
                onClick && onClick(laneId);
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

export default LaneTools;
