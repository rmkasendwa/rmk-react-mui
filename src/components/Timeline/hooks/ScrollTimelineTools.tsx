import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import {
  Button,
  ButtonGroup,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { ElementTool } from '../../SearchSyncToolbar';
import { JumpToDateToolProps, useJumpToDateTool } from './JumpToDateTool';

export interface ScrollTimelineToolsProps {
  JumpToDateToolProps?: Partial<JumpToDateToolProps>;
  scrollToDate?: (date: Date) => void;
  showJumpToOptimalTimeScaleTool?: boolean;
  jumpToOptimalTimeScale?: () => void;
  canJumpToPreviousUnitTimeScale?: boolean;
  jumpToPreviousUnitTimeScale?: () => void;
  canJumpToNextUnitTimeScale?: boolean;
  jumpToNextUnitTimeScale?: () => void;
  showNavigationTools?: boolean;
}

export const useScrollTimelineTools = ({
  JumpToDateToolProps,
  scrollToDate,
  showJumpToOptimalTimeScaleTool = false,
  jumpToOptimalTimeScale,
  canJumpToPreviousUnitTimeScale = true,
  jumpToPreviousUnitTimeScale,
  canJumpToNextUnitTimeScale = true,
  jumpToNextUnitTimeScale,
  showNavigationTools = false,
}: ScrollTimelineToolsProps = {}) => {
  const { breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const {
    icon: jumpToDateIcon,
    popupElement: jumpToDatePopupElement,
    onClick: jumpToDateOnClick,
    extraToolProps: { closePopup: jumpToDateClosePopup },
    ref: jumpToDateAnchorRef,
  } = useJumpToDateTool({
    ...JumpToDateToolProps,
    onChange: (selectedDate) => {
      if (selectedDate) {
        selectedDate.setHours(0, 0, 0, 0);
        scrollToDate?.(selectedDate);
      }
      jumpToDateClosePopup();
    },
  });

  const todayToolElement = (
    <Button
      variant="contained"
      color="inherit"
      size="small"
      onClick={() => {
        scrollToDate?.(new Date());
      }}
      sx={{
        height: 32,
      }}
    >
      Today
    </Button>
  );
  const collapsedTodayToolElement = (
    <Tooltip title="Jump to today">
      <Button
        ref={jumpToDateAnchorRef}
        variant="contained"
        color="inherit"
        size="small"
        onClick={() => {
          scrollToDate?.(new Date());
        }}
        sx={{
          px: 1,
          minWidth: 'auto !important',
          width: 32,
        }}
      >
        <TodayIcon />
      </Button>
    </Tooltip>
  );
  const jumpToDateToolElement = (
    <Tooltip title="Jump to date">
      <Button
        ref={jumpToDateAnchorRef}
        variant="contained"
        color="inherit"
        size="small"
        onClick={jumpToDateOnClick}
        sx={{
          px: 1,
          minWidth: 'auto !important',
          width: 32,
        }}
      >
        {jumpToDateIcon}
      </Button>
    </Tooltip>
  );
  const jumpToOptimalTimeScaleToolElement = (
    <Tooltip title="Jump to optimal timescale">
      <Button
        variant="contained"
        color="inherit"
        size="small"
        onClick={jumpToOptimalTimeScale}
        sx={{
          px: 1,
          minWidth: 'auto !important',
          width: 32,
        }}
      >
        <HighlightAltIcon />
      </Button>
    </Tooltip>
  );
  const jumpToUnitTimeScaleToolsElement = (
    <ButtonGroup
      size="small"
      variant="contained"
      color="inherit"
      disableElevation
      sx={{
        display: 'flex',
      }}
    >
      <Button
        onClick={jumpToPreviousUnitTimeScale}
        disabled={!canJumpToPreviousUnitTimeScale}
        sx={{
          px: 1,
          minWidth: 'auto !important',
          width: 32,
        }}
      >
        <NavigateBeforeIcon />
      </Button>
      <Button
        onClick={jumpToNextUnitTimeScale}
        disabled={!canJumpToNextUnitTimeScale}
        sx={{
          px: 1,
          minWidth: 'auto !important',
          width: 32,
        }}
      >
        <NavigateNextIcon />
      </Button>
    </ButtonGroup>
  );

  let elementMaxWidth = 164;
  let collapsedElementMaxWidth = 70;

  if (showJumpToOptimalTimeScaleTool) {
    elementMaxWidth += 36;
    collapsedElementMaxWidth += 36;
  }

  if (showNavigationTools) {
    elementMaxWidth += 70;
    collapsedElementMaxWidth += 70;
  }

  return {
    element: (
      <Stack
        direction="row"
        sx={{
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {!isSmallScreenSize ? (
          <Typography variant="body2">Jump to:</Typography>
        ) : null}
        {todayToolElement}
        {jumpToDateToolElement}
        {jumpToDatePopupElement}
        {showJumpToOptimalTimeScaleTool && jumpToOptimalTimeScale
          ? jumpToOptimalTimeScaleToolElement
          : null}
        {showNavigationTools ? jumpToUnitTimeScaleToolsElement : null}
      </Stack>
    ),
    elementMaxWidth,
    collapsedElement: (
      <Stack
        direction="row"
        sx={{
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {collapsedTodayToolElement}
        {jumpToDateToolElement}
        {jumpToDatePopupElement}
        {showJumpToOptimalTimeScaleTool && jumpToOptimalTimeScale
          ? jumpToOptimalTimeScaleToolElement
          : null}
        {showNavigationTools ? jumpToUnitTimeScaleToolsElement : null}
      </Stack>
    ),
    collapsedElementMaxWidth,
  } as ElementTool;
};
