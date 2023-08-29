import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  outlinedInputClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';

import {
  PaginatedRecordsOptions,
  usePaginatedRecords,
} from '../hooks/DataFetching';
import { PaginatedResponseData } from '../models/Utils';
import Card, { CardProps } from './Card';
import IconLoadingScreen from './IconLoadingScreen';
import Table, { BaseDataRow, TableProps } from './Table';

export interface ExternallyPaginatedTableCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ExternallyPaginatedTableCardClassKey =
  keyof ExternallyPaginatedTableCardClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiExternallyPaginatedTableCard: ExternallyPaginatedTableCardProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiExternallyPaginatedTableCard: keyof ExternallyPaginatedTableCardClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiExternallyPaginatedTableCard?: {
      defaultProps?: ComponentsProps['MuiExternallyPaginatedTableCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiExternallyPaginatedTableCard'];
      variants?: ComponentsVariants['MuiExternallyPaginatedTableCard'];
    };
  }
}
//#endregion

export const getExternallyPaginatedTableCardUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiExternallyPaginatedTableCard', slot);
};

const slots: Record<
  ExternallyPaginatedTableCardClassKey,
  [ExternallyPaginatedTableCardClassKey]
> = {
  root: ['root'],
};

export const externallyPaginatedTableCardClasses: ExternallyPaginatedTableCardClasses =
  generateUtilityClasses(
    'MuiExternallyPaginatedTableCard',
    Object.keys(slots) as ExternallyPaginatedTableCardClassKey[]
  );

export interface ExternallyPaginatedTableCardProps<
  RecordRow extends BaseDataRow = any
> extends Omit<TableProps<RecordRow>, 'rows'>,
    NonNullable<Pick<CardProps, 'title'>>,
    Pick<PaginatedRecordsOptions<RecordRow>, 'revalidationKey'> {
  recordsFinder: (
    options: Pick<
      PaginatedRecordsOptions<RecordRow>,
      'limit' | 'offset' | 'searchTerm'
    >
  ) => Promise<PaginatedResponseData<RecordRow>>;
  limit?: number;
  CardProps?: Partial<CardProps>;
  pathToAddNew?: string;
  enableExternalPagination?: boolean;
}

export const ExternallyPaginatedTableCard = forwardRef<
  HTMLDivElement,
  ExternallyPaginatedTableCardProps
>(function ExternallyPaginatedTableCard(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiExternallyPaginatedTableCard',
  });
  const {
    className,
    title,
    recordsFinder,
    revalidationKey,
    CardProps = {},
    pathToAddNew,
    limit: limitProp = 100,
    parentBackgroundColor,
    enableExternalPagination = true,
    ...rest
  } = props;

  let { labelPlural, labelSingular } = props;

  const classes = composeClasses(
    slots,
    getExternallyPaginatedTableCardUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const {
    sx: CardPropsSx,
    SearchSyncToolbarProps,
    CardBodyProps = {},
    ...CardPropsRest
  } = CardProps;
  const { sx: CardBodyPropsSx, ...CardBodyPropsRest } = CardBodyProps;

  !labelPlural && typeof title === 'string' && (labelPlural = title);
  !labelSingular &&
    labelPlural &&
    (labelSingular = labelPlural.replace(/s$/gi, ''));

  const { palette } = useTheme();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(limitProp);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLimit(limitProp);
  }, [limitProp]);

  // Record loading
  const { currentPageRecords, load, loading, errorMessage, recordsTotalCount } =
    usePaginatedRecords(
      () => {
        return recordsFinder({
          limit,
          offset,
          searchTerm,
        });
      },
      {
        limit,
        offset,
        revalidationKey: `${revalidationKey}${searchTerm}`,
      }
    );

  return (
    <Card
      {...CardPropsRest}
      {...{ title, load, loading, errorMessage }}
      SearchSyncToolbarProps={{
        ...SearchSyncToolbarProps,
        onSearch: (searchTerm) => setSearchTerm(searchTerm),
      }}
      CardBodyProps={{
        ...CardBodyPropsRest,
        sx: {
          p: 0,
          ...CardBodyPropsSx,
        },
      }}
      sx={{
        [`.${outlinedInputClasses.root}`]: {
          bgcolor: parentBackgroundColor || palette.background.paper,
        },
        ...CardPropsSx,
      }}
    >
      {(() => {
        if (recordsTotalCount <= 0 && (loading || errorMessage)) {
          return (
            <IconLoadingScreen
              {...{ errorMessage, load, loading }}
              recordLabelPlural={labelPlural}
              recordLabelSingular={labelSingular}
              pathToAddNew={pathToAddNew}
            />
          );
        }
        return (
          <Table
            ref={ref}
            {...rest}
            {...{
              labelPlural,
              labelSingular,
              parentBackgroundColor,
              rowsPerPage: limit,
              ...(() => {
                if (enableExternalPagination) {
                  return {
                    totalRowCount: recordsTotalCount,
                    onRowsPerPageChange: (rowsPerPage) => {
                      setLimit(rowsPerPage);
                    },
                    onChangePage: (pageIndex) => {
                      setOffset(limit * pageIndex);
                    },
                  };
                }
              })(),
            }}
            className={clsx(classes.root)}
            rows={currentPageRecords}
          />
        );
      })()}
    </Card>
  );
});

export default ExternallyPaginatedTableCard;
