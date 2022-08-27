import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FC } from 'react';

import SearchSyncToolbar, {
  ISearchSyncToolbarProps,
} from './SearchSyncToolbar';

export interface IPageTitleProps extends ISearchSyncToolbarProps {}

export const PageTitle: FC<IPageTitleProps> = ({
  tools,
  title,
  TitleProps = {},
  sx,
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
      sx={{
        px: '0 !important',
        ...sx,
      }}
    />
  );
};

export default PageTitle;
