import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import Toolbar, { ToolbarProps } from '@mui/material/Toolbar';
import { Children, FC, ReactNode, useEffect, useState } from 'react';

import TextField from './InputFields/TextField';
import ReloadIconButton, { IReloadIconButtonProps } from './ReloadIconButton';

export interface ISearchSyncToolbarProps
  extends ToolbarProps,
    Partial<Pick<IReloadIconButtonProps, 'load' | 'loading' | 'errorMessage'>> {
  searchTerm?: string;
  searchFieldPlaceholder?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  tools?: ReactNode | ReactNode[];
}

export const SearchSyncToolbar: FC<ISearchSyncToolbarProps> = ({
  searchTerm: searchTermProp,
  searchFieldPlaceholder,
  load,
  loading,
  errorMessage,
  onChangeSearchTerm,
  tools,
  ...rest
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(searchTermProp ?? '');
  }, [searchTermProp]);

  return (
    <Toolbar {...rest}>
      <Grid container alignItems="center" sx={{ columnGap: 2 }}>
        <Grid item>
          <SearchIcon color="inherit" sx={{ display: 'flex' }} />
        </Grid>
        <Grid item xs>
          <TextField
            fullWidth
            placeholder={searchFieldPlaceholder}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: 'default' },
            }}
            variant="standard"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              onChangeSearchTerm && onChangeSearchTerm(event.target.value);
            }}
          />
        </Grid>
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
        {load ? (
          <Grid item>
            <ReloadIconButton {...{ load, loading, errorMessage }} />
          </Grid>
        ) : null}
      </Grid>
    </Toolbar>
  );
};

export default SearchSyncToolbar;
