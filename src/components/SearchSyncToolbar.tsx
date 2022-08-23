import SearchIcon from '@mui/icons-material/Search';
import {
  ClickAwayListener,
  IconButton,
  Typography,
  TypographyProps,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Toolbar, { ToolbarProps } from '@mui/material/Toolbar';
import { Children, FC, ReactNode, useEffect, useState } from 'react';

import TextField from './InputFields/TextField';
import ReloadIconButton, { IReloadIconButtonProps } from './ReloadIconButton';

export interface ISearchSyncToolbarProps
  extends Omit<ToolbarProps, 'title'>,
    Partial<Pick<IReloadIconButtonProps, 'load' | 'loading' | 'errorMessage'>> {
  title?: ReactNode;
  searchTerm?: string;
  searchFieldPlaceholder?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  tools?: ReactNode | ReactNode[];
  TitleProps?: Partial<TypographyProps>;
}

export const SearchSyncToolbar: FC<ISearchSyncToolbarProps> = ({
  title,
  searchTerm: searchTermProp,
  searchFieldPlaceholder,
  load,
  loading,
  errorMessage,
  onChangeSearchTerm,
  tools,
  TitleProps = {},
  ...rest
}) => {
  const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFieldOpen, setSearchFieldOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(searchTermProp ?? '');
  }, [searchTermProp]);

  return (
    <Toolbar {...rest}>
      <Grid container sx={{ alignItems: 'center', columnGap: 1 }}>
        {title ? (
          <>
            <Grid item xs>
              <Typography
                {...titlePropsRest}
                noWrap
                sx={{
                  fontWeight: 'bold',
                  lineHeight: '48px',
                  ...titlePropsSx,
                }}
              >
                {title}
              </Typography>
            </Grid>
            <Grid item sx={{ display: 'flex' }}>
              {searchFieldOpen ? (
                <ClickAwayListener
                  onClickAway={() => {
                    if (searchTerm.length <= 0) {
                      setSearchFieldOpen(false);
                    }
                  }}
                >
                  <TextField
                    placeholder={searchFieldPlaceholder}
                    InputProps={{
                      startAdornment: <SearchIcon color="inherit" />,
                      sx: { fontSize: 'default' },
                    }}
                    variant="outlined"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      onChangeSearchTerm &&
                        onChangeSearchTerm(event.target.value);
                    }}
                    sx={{
                      width: 200,
                    }}
                  />
                </ClickAwayListener>
              ) : (
                <IconButton onClick={() => setSearchFieldOpen(true)}>
                  <SearchIcon color="inherit" />
                </IconButton>
              )}
            </Grid>
          </>
        ) : (
          <>
            <Grid item sx={{ display: 'flex' }}>
              <SearchIcon color="inherit" />
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
          </>
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
