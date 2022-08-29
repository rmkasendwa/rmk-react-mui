import { Box, BoxProps, Divider, gridClasses, useTheme } from '@mui/material';
import Paper, { PaperProps } from '@mui/material/Paper';
import { FC, ReactNode } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import { ILoadingProps } from '../interfaces/Utils';
import SearchSyncToolbar, {
  ISearchSyncToolbarProps,
} from './SearchSyncToolbar';

export interface ICardProps
  extends Partial<Omit<PaperProps, 'title'>>,
    Partial<ILoadingProps> {
  title?: ReactNode;
  load?: () => void;
  SearchSyncToolbarProps?: Partial<ISearchSyncToolbarProps>;
  CardBodyProps?: Partial<BoxProps>;
}

export const Card: FC<ICardProps> = ({
  children,
  title,
  load,
  loading,
  errorMessage,
  SearchSyncToolbarProps = {},
  CardBodyProps = {},
  ...rest
}) => {
  const { sx: searchSyncToolbarPropsSx, ...searchSyncToolbarPropsRest } =
    SearchSyncToolbarProps;
  const { sx: cardBodyPropsSx, ...cardBodyPropsRest } = CardBodyProps;
  const { loading: contextLoading, errorMessage: contextErrorMessage } =
    useLoadingContext();
  const { spacing } = useTheme();

  return (
    <Paper {...rest}>
      {title && (
        <Paper
          elevation={0}
          component="header"
          sx={{ position: 'sticky', top: 0, zIndex: 5 }}
        >
          <SearchSyncToolbar
            load={load}
            loading={loading || contextLoading}
            errorMessage={errorMessage || contextErrorMessage}
            title={title}
            hasSearchTool={false}
            {...searchSyncToolbarPropsRest}
            sx={{
              pr: `${spacing(1.75)} !important`,
              [`&>.${gridClasses.container}`]: {
                columnGap: 1,
              },
              ...searchSyncToolbarPropsSx,
            }}
          />
          <Divider />
        </Paper>
      )}
      <Box
        {...cardBodyPropsRest}
        component="section"
        sx={{ pt: 2, px: 3, pb: 3, ...cardBodyPropsSx }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default Card;
