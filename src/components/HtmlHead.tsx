import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import { FC, useEffect } from 'react';

import { PageHistory } from '../models/Page';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiHtmlHead: HtmlHeadProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiHtmlHead?: {
      defaultProps?: ComponentsProps['MuiHtmlHead'];
      variants?: ComponentsVariants['MuiHtmlHead'];
    };
  }
}
//#endregion

export const getRouteHistory = (): PageHistory => {
  return StorageManager.get('page-history') || [];
};

export const clearRouteHistory = () => StorageManager.remove('page-history');

export interface HtmlHeadProps {
  title: string;
  description?: string;
  applicationName?: string;
  showApplicationName?: boolean;
}

export const HtmlHead: FC<HtmlHeadProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiHtmlHead' });
  const {
    title,
    description,
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

  useEffect(() => {
    if (description) {
      let descriptionMetaElement = document.head.querySelector(
        'meta[name="description"]'
      );
      if (!descriptionMetaElement) {
        descriptionMetaElement = document.createElement('meta');
        descriptionMetaElement.setAttribute('name', 'description');
        document.head.append(descriptionMetaElement);
      }
      descriptionMetaElement.setAttribute('content', description);
    }
  }, [description]);

  return null;
};

export default HtmlHead;
