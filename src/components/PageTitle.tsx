import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FC } from 'react';

import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface PageTitleProps extends SearchSyncToolbarProps {}

export const PageTitle: FC<PageTitleProps> = ({
  tools,
  title,
  TitleProps = {},
  ...rest
}) => {
  const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;
  const { breakpoints } = useTheme();
  const largeScreen = useMediaQuery(breakpoints.up('sm'));

  return (
    <SearchSyncToolbar
      {...{ tools }}
      title={largeScreen ? title : null}
      hasSearchTool={false}
      {...rest}
      TitleProps={{
        variant: 'h3',
        ...titlePropsRest,
        sx: {
          fontSize: 22,
          lineHeight: '50px',
          [breakpoints.down('md')]: {
            fontSize: 18,
          },
          ...titlePropsSx,
        },
      }}
    />
  );
};

export default PageTitle;
