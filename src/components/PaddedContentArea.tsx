import {
  Container,
  ContainerProps,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Children, FC, ReactNode } from 'react';

export interface IPaddedContentAreaProps extends ContainerProps {
  title?: string;
  tools?: ReactNode | ReactNode[];
}

export const PaddedContentArea: FC<IPaddedContentAreaProps> = ({
  children,
  title,
  sx,
  tools,
  ...rest
}) => {
  const theme = useTheme();
  const smallScreenBreakpoint = theme.breakpoints.down('sm');
  const largeScreen = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Container
      component="main"
      {...rest}
      sx={{
        flex: 1,
        p: 3,
        [smallScreenBreakpoint]: {
          p: 2,
        },
        ...sx,
      }}
    >
      {((title && largeScreen) || tools) && (
        <Grid
          container
          spacing={1}
          sx={{
            mb: 3,
            alignItems: 'center',
            [smallScreenBreakpoint]: {
              mb: 2,
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
                  fontSize: 28,
                  [theme.breakpoints.down('md')]: {
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
    </Container>
  );
};

export default PaddedContentArea;
