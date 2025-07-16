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

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTextAreaField: TextAreaFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTextAreaField: keyof TextAreaFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTextAreaField?: {
      defaultProps?: ComponentsProps['MuiTextAreaField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTextAreaField'];
      variants?: ComponentsVariants['MuiTextAreaField'];
    };
  }
}
//#endregion

export const getTextAreaFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTextAreaField', slot);
};

const slots: Record<TextAreaFieldClassKey, [TextAreaFieldClassKey]> = {
  root: ['root'],
};

export const textAreaFieldClasses: TextAreaFieldClasses =
  generateUtilityClasses(
    'MuiTextAreaField',
    Object.keys(slots) as TextAreaFieldClassKey[]
  );

export interface TextAreaFieldProps extends TextFieldProps {
  value?: string;
  showTextCount?: boolean;
}

export const TextAreaField = forwardRef<HTMLDivElement, TextAreaFieldProps>(
  function TextAreaField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiTextAreaField' });
    const {
      className,
      value,
      onChange,
      slotProps,
      minRows = 4,
      maxRows,
      rows,
      showTextCount = true,
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

    const { spacing } = useTheme();
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
        rows={rows}
        {...(() => {
          if (!rows) {
            return {
              minRows,
              maxRows,
            };
          }
        })()}
        {...rest}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            sx: {
              alignItems: 'flex-end',
              pb: 3,
            },
            endAdornment: (() => {
              if (showTextCount && inputValue.length > 0) {
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
                      if (
                        slotProps?.htmlInput &&
                        'maxLength' in slotProps.htmlInput
                      ) {
                        return (
                          <Typography component="div" variant="body2">
                            {addThousandCommas(inputValue.length)}/
                            {addThousandCommas(slotProps.htmlInput.maxLength)}
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
          },
        }}
        multiline
      />
    );
  }
);

export default TextAreaField;
