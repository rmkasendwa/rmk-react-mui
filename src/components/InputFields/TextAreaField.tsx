import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';

import TextField, { TextFieldProps } from './TextField';

export interface TextAreaFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TextAreaFieldClassKey = keyof TextAreaFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTextAreaField: TextAreaFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTextAreaField: keyof TextAreaFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTextAreaField?: {
      defaultProps?: ComponentsProps['MuiTextAreaField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTextAreaField'];
      variants?: ComponentsVariants['MuiTextAreaField'];
    };
  }
}

export interface TextAreaFieldProps extends TextFieldProps {
  value?: string;
}

export function getTextAreaFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTextAreaField', slot);
}

export const textAreaFieldClasses: TextAreaFieldClasses =
  generateUtilityClasses('MuiTextAreaField', ['root']);

const slots = {
  root: ['root'],
};

export const TextAreaField = forwardRef<HTMLDivElement, TextAreaFieldProps>(
  function TextAreaField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTextAreaField' });
    const {
      className,
      value,
      onChange,
      inputProps,
      InputProps = {},
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getTextAreaFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: InputPropsSx, ...InputPropsRest } = InputProps;
    const { spacing } = useTheme();
    const { maxLength } = inputProps ?? {};
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    return (
      <TextField
        ref={ref}
        className={clsx(classes.root)}
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          onChange && onChange(event);
        }}
        minRows={4}
        {...{ inputProps }}
        {...rest}
        InputProps={{
          ...InputPropsRest,
          sx: {
            alignItems: 'flex-end',
            pb: 3,
            ...InputPropsSx,
          },
          endAdornment: (() => {
            if (inputValue.length > 0) {
              return (
                <Box
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: spacing(2),
                    bottom: spacing(1),
                  }}
                >
                  {(() => {
                    if (maxLength) {
                      return (
                        <Typography component="div" variant="body2">
                          {addThousandCommas(inputValue.length)}/
                          {addThousandCommas(maxLength)}
                        </Typography>
                      );
                    }
                    return (
                      <Typography component="div" variant="body2">
                        {addThousandCommas(inputValue.length)}
                      </Typography>
                    );
                  })()}
                </Box>
              );
            }
          })(),
        }}
        multiline
      />
    );
  }
);

export default TextAreaField;
