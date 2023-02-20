import {
  BoxProps,
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
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface HtmlViewerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type HtmlViewerClassKey = keyof HtmlViewerClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiHtmlViewer: HtmlViewerProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiHtmlViewer: keyof HtmlViewerClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiHtmlViewer?: {
      defaultProps?: ComponentsProps['MuiHtmlViewer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiHtmlViewer'];
      variants?: ComponentsVariants['MuiHtmlViewer'];
    };
  }
}

export interface HtmlViewerProps extends Partial<BoxProps> {
  children: string;
}

export function getHtmlViewerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiHtmlViewer', slot);
}

export const htmlViewerClasses: HtmlViewerClasses = generateUtilityClasses(
  'MuiHtmlViewer',
  ['root']
);

const slots = {
  root: ['root'],
};

export const HtmlViewer = forwardRef<HTMLDivElement, HtmlViewerProps>(
  function HtmlViewer(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiHtmlViewer' });
    const { className, children, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getHtmlViewerUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();

    const urlMatchingRegex =
      /.\s*((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))\s*./g;
    const emailMatchingRegex =
      /.\s*([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)\s*./g;

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        dangerouslySetInnerHTML={{
          __html: children
            .replace(urlMatchingRegex, (matchedString, urlString: string) => {
              if (
                !matchedString
                  .replace(urlString, '')
                  .replace(/\s+/g, '')
                  .match(/(""|''|><)/g)
              ) {
                return matchedString.replace(
                  urlString,
                  `<a href="${urlString}" target="_blank">${urlString}</a>`
                );
              }
              return matchedString;
            })
            .replace(
              emailMatchingRegex,
              (matchedString, emailString: string) => {
                if (
                  !matchedString
                    .replace(emailString, '')
                    .replace(/\s+/g, '')
                    .match(/(""|''|><)/g)
                ) {
                  return matchedString.replace(
                    emailString,
                    `<a href="mailto:${emailString}">${emailString}</a>`
                  );
                }
                return matchedString;
              }
            ),
        }}
        sx={{
          whiteSpace: 'pre-wrap',
          a: {
            color: palette.text.primary,
            textDecoration: 'none',
            fontWeight: 500,
            ':hover': {
              color: palette.primary.main,
              textDecoration: 'underline',
            },
          },
          ...sx,
        }}
      />
    );
  }
);

export default HtmlViewer;
