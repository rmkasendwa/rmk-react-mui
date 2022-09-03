import { Box } from '@mui/material';
import { FC } from 'react';

import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';

export interface IFixedHeaderContentAreaProps extends IPaddedContentAreaProps {}

export const FixedHeaderContentArea: FC<IFixedHeaderContentAreaProps> = ({
  title,
  children,
  sx,
  ...rest
}) => {
  return (
    <PaddedContentArea
      title={title}
      {...rest}
      sx={{
        pb: `0 !important`,
        position: 'absolute',
        width: '100%',
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </PaddedContentArea>
  );
};

export default FixedHeaderContentArea;
