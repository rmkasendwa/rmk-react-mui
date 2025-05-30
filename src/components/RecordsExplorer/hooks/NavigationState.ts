import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import * as Yup from 'yup';
import { ObjectShape } from 'yup';

import { useParamStorage } from '../../../hooks/ParamStorage';
import { SortDirection, sortDirections } from '../../../models/Sort';
import { BaseDataRow, tableSearchParamValidationSpec } from '../../Table';
import { timelineSearchParamValidationSpec } from '../../Timeline';
import {
  Conjunction,
  FilterOperator,
  filterConjunctions,
  filterOperators,
} from '../models';

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

export interface RecordsExplorerNavigationStateProps<
  ValidationSpec extends ObjectShape = any
> {
  id?: string;
  clearSearchStateOnUnmount?: boolean;
  ignoreUnspecifiedParams?: boolean;
  spec?: ValidationSpec;
}

export const useRecordsExplorerNavigationState = <
  RecordRow extends BaseDataRow,
  ValidationSpec extends ObjectShape = any
>(
  inProps: RecordsExplorerNavigationStateProps<ValidationSpec> = {}
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiRecordsExplorerNavigationState',
  });
  const { id, clearSearchStateOnUnmount = false, spec } = props;

  const baseSpec = {
    ...timelineSearchParamValidationSpec,
    ...tableSearchParamValidationSpec,
    view: Yup.string(),
    groupBy: Yup.array().of(
      Yup.object({
        id: Yup.mixed<keyof RecordRow>().required(),
        sortDirection: Yup.mixed<SortDirection>()
          .required()
          .oneOf([...sortDirections]),
      })
    ),
    expandedGroups: Yup.mixed<'All' | 'None' | string[]>(),
    expandedGroupsInverted: Yup.boolean(),
    sortBy: Yup.array().of(
      Yup.object({
        id: Yup.mixed<keyof RecordRow>().required(),
        sortDirection: Yup.mixed<SortDirection>()
          .required()
          .oneOf([...sortDirections]),
      })
    ),
    filterBy: Yup.object({
      conjunction: Yup.mixed<Conjunction>().oneOf([...filterConjunctions]),
      conditions: Yup.array()
        .of(
          Yup.object({
            fieldId: Yup.mixed<keyof RecordRow>().required(),
            operator: Yup.mixed<FilterOperator>().oneOf([...filterOperators]),
            value: Yup.mixed<string | number | (string | number)[]>(),
          })
        )
        .required(),
    }).default(undefined),
    search: Yup.string(),
    modifiedKeys: Yup.array().of(Yup.string().required()),
    createNewRecord: Yup.boolean(),
    selectedRecord: Yup.string(),
    editRecord: Yup.boolean(),
    selectedDataPreset: Yup.mixed<string | number>(),
  } as const;

  return useParamStorage({
    spec: {
      ...baseSpec,
      ...spec,
    } as typeof baseSpec & ValidationSpec,
    id,
    clearSearchStateOnUnmount,
  });
};

export type RecordsExplorerNavigationState = ReturnType<
  typeof useRecordsExplorerNavigationState
>;
