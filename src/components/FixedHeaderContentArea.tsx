import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';

import PaddedContentArea, { PaddedContentAreaProps } from './PaddedContentArea';

export interface FixedHeaderContentAreaProps extends PaddedContentAreaProps {
  BodyProps?: Partial<BoxProps>;
}

export const FixedHeaderContentArea: FC<FixedHeaderContentAreaProps> = ({
  title,
  children,
  sx,
  BodyProps = {},
  ...rest
}) => {
  const { sx: BodyPropsSx, ...BodyPropsRest } = BodyProps;

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
        {...BodyPropsRest}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          ...BodyPropsSx,
        }}
      >
        {children}
      </Box>
    </PaddedContentArea>
  );
};

export default FixedHeaderContentArea;
