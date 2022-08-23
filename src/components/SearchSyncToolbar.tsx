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
  /**
   * Determines whether the component should be rendered with a search tool
   *
   * @default true
   */
  hasSearchTool?: boolean;
  searchTerm?: string;
  searchFieldPlaceholder?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  /**
   * Determines whether the component should be rendered with a synchronize tool
   * Note: The synchronize tool will not be rendered if the load function is not supplied regardless of whether this value is set to true
   *
   * @default true
   */
  hasSyncTool?: boolean;
  tools?: ReactNode | ReactNode[];
  TitleProps?: Partial<TypographyProps>;
}

export const SearchSyncToolbar: FC<ISearchSyncToolbarProps> = ({
  title,
  hasSearchTool = true,
  searchTerm: searchTermProp,
  searchFieldPlaceholder,
  hasSyncTool = true,
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
            {hasSearchTool ? (
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
            ) : null}
          </>
        ) : hasSearchTool ? (
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
        ) : null}
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
        {hasSyncTool && load ? (
          <Grid item>
            <ReloadIconButton {...{ load, loading, errorMessage }} />
          </Grid>
        ) : null}
      </Grid>
    </Toolbar>
  );
};

export default SearchSyncToolbar;
