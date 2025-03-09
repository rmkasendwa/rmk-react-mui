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
import { merge } from 'lodash';

export interface SearchFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SearchFieldClassKey = keyof SearchFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSearchField: SearchFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSearchField: keyof SearchFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSearchField?: {
      defaultProps?: ComponentsProps['MuiSearchField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSearchField'];
      variants?: ComponentsVariants['MuiSearchField'];
    };
  }
}
//#endregion

export const getSearchFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiSearchField', slot);
};

const slots: Record<SearchFieldClassKey, [SearchFieldClassKey]> = {
  root: ['root'],
};

export const searchFieldClasses: SearchFieldClasses = generateUtilityClasses(
  'MuiSearchField',
  Object.keys(slots) as SearchFieldClassKey[]
);

export interface SearchFieldProps extends TextFieldProps {
  searchTerm?: string;
  onChangeSearchTerm?: (searchTerm: string) => void;
  onSearch?: (searchTerm: string) => void;
  searchVelocity?: 'slow' | 'fast' | number;
}

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(
  function SearchField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiSearchField' });
    const {
      className,
      searchTerm: searchTermProp,
      onSearch,
      onChangeSearchTerm,
      searchVelocity,
      onChange,
      onBlur,
      onKeyUp,
      slotProps,
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

    //#region Refs
    const searchTimeoutRef = useRef<NodeJS.Timeout>(undefined);
    //#endregion

    const [searchTerm, setSearchTerm] = useState(searchTermProp || '');

    useEffect(() => {
      setSearchTerm((prevSearchTerm) => {
        if (searchTermProp != null) {
          return searchTermProp;
        }
        return prevSearchTerm;
      });
    }, [searchTermProp]);

    return (
      <TextField
        ref={ref}
        placeholder="Search..."
        {...rest}
        className={clsx(classes.root)}
        slotProps={merge(
          {
            input: {
              startAdornment: (
                <SearchIcon
                  color="inherit"
                  sx={{
                    mr: 0.5,
                  }}
                />
              ),
              sx: { fontSize: 'default' },
            },
          },
          slotProps
        )}
        value={searchTerm}
        onChange={(event) => {
          if (searchTermProp == null || !onChangeSearchTerm) {
            setSearchTerm(event.target.value);
          }
          onChangeSearchTerm && onChangeSearchTerm(event.target.value);
          if (onSearch) {
            if (searchVelocity === 'fast' || event.target.value.length <= 0) {
              onSearch(event.target.value);
            } else if (typeof searchVelocity === 'number') {
              clearTimeout(searchTimeoutRef.current);
              searchTimeoutRef.current = setTimeout(() => {
                onSearch(event.target.value);
              }, searchVelocity);
            }
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
