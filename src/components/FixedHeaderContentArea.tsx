import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';

import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';

export interface IFixedHeaderContentAreaProps extends IPaddedContentAreaProps {
  BodyProps?: Partial<BoxProps>;
}

export const FixedHeaderContentArea: FC<IFixedHeaderContentAreaProps> = ({
  title,
  children,
  sx,
  BodyProps = {},
  ...rest
}) => {
  const { sx: bodyPropsSx, ...bodyPropsRest } = BodyProps;

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
        {...bodyPropsRest}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          ...bodyPropsSx,
        }}
      >
        {children}
      </Box>
    </PaddedContentArea>
  );
};

export default FixedHeaderContentArea;
