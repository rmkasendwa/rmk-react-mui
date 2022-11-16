import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import { FC, useEffect } from 'react';

import { PageHistory } from '../interfaces/Page';

export interface HtmlHeadClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type HtmlHeadClassKey = keyof HtmlHeadClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiHtmlHead: HtmlHeadProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiHtmlHead: keyof HtmlHeadClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiHtmlHead?: {
      defaultProps?: ComponentsProps['MuiHtmlHead'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiHtmlHead'];
      variants?: ComponentsVariants['MuiHtmlHead'];
    };
  }
}

export interface HtmlHeadProps {
  title: string;
  applicationName?: string;
  showApplicationName?: boolean;
}

export function getHtmlHeadUtilityClass(slot: string): string {
  return generateUtilityClass('MuiHtmlHead', slot);
}

export const htmlHeadClasses: HtmlHeadClasses = generateUtilityClasses(
  'MuiHtmlHead',
  ['root']
);

export const HtmlHead: FC<HtmlHeadProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiHtmlHead' });
  const {
    title,
    showApplicationName = false,
    applicationName = 'Application',
  } = props;

  useEffect(() => {
    if (title) {
      const history: PageHistory = StorageManager.get('page-history') || [];
      history.unshift({
        title,
        pathName: window.location.pathname,
        search: window.location.search,
      });
      history.splice(500);
      StorageManager.add('page-history', history);
      const titleElement = document.head.querySelector('title');
      if (titleElement != null) {
        if (showApplicationName) {
          titleElement.innerText = `${title} | ${applicationName}`;
        } else {
          titleElement.innerText = title;
        }
      }
    } else {
      const titleElement = document.head.querySelector('title');
      if (titleElement != null) {
        applicationName && (titleElement.innerText = applicationName);
      }
    }
  }, [applicationName, showApplicationName, title]);

  return null;
};

export default HtmlHead;
