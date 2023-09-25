import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';

import {
  ParamStorage,
  useReactRouterDOMSearchParams,
} from '../../../hooks/ReactRouterDOM';
import { recordsExplorerSearchParamValidationSpec } from '../models';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRecordsExplorerNavigationState: RecordsExplorerNavigationStateProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiRecordsExplorerNavigationState?: {
      defaultProps?: ComponentsProps['MuiRecordsExplorerNavigationState'];
      variants?: ComponentsVariants['MuiRecordsExplorerNavigationState'];
    };
  }
}
//#endregion

export interface RecordsExplorerNavigationStateProps {
  id?: string;
  paramStorage?: ParamStorage;
  clearSearchStateOnUnmount?: boolean;
}

export const useRecordsExplorerNavigationState = (
  inProps: RecordsExplorerNavigationStateProps = {}
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiRecordsExplorerNavigationState',
  });
  const { id, paramStorage, clearSearchStateOnUnmount = false } = props;
  return useReactRouterDOMSearchParams({
    mode: 'json',
    spec: recordsExplorerSearchParamValidationSpec,
    id,
    paramStorage,
    clearSearchStateOnUnmount,
  });
};
