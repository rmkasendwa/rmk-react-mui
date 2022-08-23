import Box, { BoxProps } from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Children, FC, ReactNode } from 'react';

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
      {((title && largeScreen) || tools) && (
        <Grid
          container
          sx={{
            gap: 1,
            alignItems: 'center',
            [smallScreenBreakpoint]: {
              justifyContent: 'end',
            },
          }}
        >
          {largeScreen && title && (
            <Grid
              item
              xs
              sx={{
                minWidth: 0,
                [smallScreenBreakpoint]: {
                  mb: 1,
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: 22,
                  lineHeight: '50px',
                  [breakpoints.down('md')]: {
                    fontSize: 18,
                  },
                }}
                noWrap
              >
                {title}
              </Typography>
            </Grid>
          )}
          {(() => {
            if (tools) {
              const toolsList = Children.toArray(tools);
              return toolsList.map((tool, index) => {
                return (
                  <Grid item key={index} sx={{ minWidth: 0 }}>
                    {tool}
                  </Grid>
                );
              });
            }
          })()}
        </Grid>
      )}
      {children}
    </Box>
  );
};

export default PaddedContentArea;
