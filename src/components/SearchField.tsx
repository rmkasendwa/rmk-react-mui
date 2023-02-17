import SearchIcon from '@mui/icons-material/Search';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useEffect, useRef, useState } from 'react';

import TextField, { TextFieldProps } from './InputFields/TextField';

export interface SearchFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SearchFieldClassKey = keyof SearchFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSearchField: SearchFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSearchField: keyof SearchFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSearchField?: {
      defaultProps?: ComponentsProps['MuiSearchField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSearchField'];
      variants?: ComponentsVariants['MuiSearchField'];
    };
  }
}

export interface SearchFieldProps extends TextFieldProps {
  searchTerm?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  onSearch?: (searchTerm: string) => void;
  searchVelocity?: 'slow' | 'fast';
}

export function getSearchFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiSearchField', slot);
}

export const searchFieldClasses: SearchFieldClasses = generateUtilityClasses(
  'MuiSearchField',
  ['root']
);

const slots = {
  root: ['root'],
};

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(
  function SearchField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiSearchField' });
    const {
      className,
      searchTerm: searchTermProp = '',
      onSearch,
      onChangeSearchTerm,
      searchVelocity,
      onChange,
      onBlur,
      onKeyUp,
      InputProps = {},
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getSearchFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: InputPropsSx, ...InputPropsRest } = InputProps;

    // Refs
    const onSearchRef = useRef(onSearch);
    const isInitialMountRef = useRef(true);
    useEffect(() => {
      onSearchRef.current = onSearch;
    }, [onSearch]);

    const [searchTerm, setSearchTerm] = useState(searchTermProp);

    useEffect(() => {
      if (searchTerm.length <= 0 && !isInitialMountRef.current) {
        onSearchRef.current && onSearchRef.current(searchTerm);
      }
    }, [searchTerm]);

    useEffect(() => {
      setSearchTerm(searchTermProp);
    }, [searchTermProp]);

    useEffect(() => {
      isInitialMountRef.current = false;
      return () => {
        isInitialMountRef.current = true;
      };
    }, []);

    return (
      <TextField
        ref={ref}
        placeholder="Search..."
        {...rest}
        className={clsx(classes.root)}
        InputProps={{
          startAdornment: (
            <SearchIcon
              color="inherit"
              sx={{
                mr: 0.5,
              }}
            />
          ),
          ...InputPropsRest,
          sx: { fontSize: 'default', ...InputPropsSx },
        }}
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
          onChangeSearchTerm && onChangeSearchTerm(event.target.value);
          if (onSearch && searchVelocity === 'fast') {
            onSearch(event.target.value);
          }
          onChange && onChange(event);
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter' && onSearch) {
            onSearch(searchTerm);
          }
          onKeyUp && onKeyUp(event);
        }}
        onBlur={(event) => {
          onSearch && onSearch(searchTerm);
          onBlur && onBlur(event);
        }}
        enableLoadingState={false}
      />
    );
  }
);

export default SearchField;