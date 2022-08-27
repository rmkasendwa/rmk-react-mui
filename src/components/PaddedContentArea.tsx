import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FC, ReactNode } from 'react';

import PageTitle from './PageTitle';

export interface IPaddedContentAreaProps extends BoxProps {
  title?: string;
  tools?: ReactNode | ReactNode[];
  breadcrumbs?: ReactNode;
}

export const PaddedContentArea: FC<IPaddedContentAreaProps> = ({
  children,
  title,
  sx,
  tools,
  breadcrumbs,
  ...rest
}) => {
  const { breakpoints } = useTheme();
  const smallScreenBreakpoint = breakpoints.down('sm');
  const largeScreen = useMediaQuery(breakpoints.up('sm'));

  return (
    <Box
      {...rest}
      sx={{
        flex: 1,
        px: 3,
        [smallScreenBreakpoint]: {
          px: 2,
        },
        ...sx,
      }}
    >
      {breadcrumbs && largeScreen ? breadcrumbs : null}
      {(title && largeScreen) || tools ? (
        <PageTitle {...{ title, tools }} />
      ) : null}
      {children}
    </Box>
  );
};

export default PaddedContentArea;
