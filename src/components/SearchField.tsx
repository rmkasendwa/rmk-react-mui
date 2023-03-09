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
import { forwardRef } from 'react';

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
      searchTerm,
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
          onChangeSearchTerm && onChangeSearchTerm(event.target.value);
          if (onSearch && searchVelocity === 'fast') {
            onSearch(event.target.value);
          }
          onChange && onChange(event);
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter' && onSearch) {
            onSearch((event.target as any).value);
          }
          onKeyUp && onKeyUp(event);
        }}
        onBlur={(event) => {
          if (searchVelocity === 'slow' && onSearch) {
            onSearch(event.target.value);
          }
          onBlur && onBlur(event);
        }}
        enableLoadingState={false}
      />
    );
  }
);

export default SearchField;
