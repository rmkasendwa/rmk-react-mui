import {
  Card,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';

import {
  UsePaginatedRecordsOptions,
  usePaginatedRecords,
} from '../hooks/Utils';
import { BaseTableRow } from '../interfaces/Table';
import { PaginatedResponseData } from '../interfaces/Utils';
import PageTitle, { PageTitleProps } from './PageTitle';
import Table, { TableProps } from './Table';

export interface ExternallyPaginatedTableCardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ExternallyPaginatedTableCardClassKey =
  keyof ExternallyPaginatedTableCardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiExternallyPaginatedTableCard: ExternallyPaginatedTableCardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiExternallyPaginatedTableCard: keyof ExternallyPaginatedTableCardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiExternallyPaginatedTableCard?: {
      defaultProps?: ComponentsProps['MuiExternallyPaginatedTableCard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiExternallyPaginatedTableCard'];
      variants?: ComponentsVariants['MuiExternallyPaginatedTableCard'];
    };
  }
}

export interface ExternallyPaginatedTableCardProps<
  RecordRow extends BaseTableRow = any
> extends Omit<TableProps<RecordRow>, 'rows'>,
    Pick<PageTitleProps, 'title'>,
    Pick<UsePaginatedRecordsOptions, 'revalidationKey'> {
  recordsFinder: (
    options: Pick<UsePaginatedRecordsOptions, 'limit' | 'offset'> & {
      searchTerm: string;
    }
  ) => Promise<PaginatedResponseData<RecordRow>>;
  recordKey?: string;
  limit?: number;
  PageTitleProps?: Partial<PageTitleProps>;
}

export function getExternallyPaginatedTableCardUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiExternallyPaginatedTableCard', slot);
}

export const externallyPaginatedTableClasses: ExternallyPaginatedTableCardClasses =
  generateUtilityClasses('MuiExternallyPaginatedTableCard', ['root']);

const slots = {
  root: ['root'],
};

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
    recordKey,
    revalidationKey,
    PageTitleProps = {},
    limit: limitProp = 100,
    ...rest
  } = props;

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

  const { ...PageTitlePropsRest } = PageTitleProps;

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
        key: recordKey,
        revalidationKey: `${revalidationKey}${searchTerm}`,
      }
    );

  return (
    <Box>
      <PageTitle
        {...PageTitlePropsRest}
        {...{ title, load, loading, errorMessage }}
        onSearch={(searchTerm) => setSearchTerm(searchTerm)}
      />
      <Card>
        <Table
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          rows={currentPageRecords}
          totalRowCount={recordsTotalCount}
          rowsPerPage={limit}
          onRowsPerPageChange={(rowsPerPage) => {
            setLimit(rowsPerPage);
          }}
          onChangePage={(pageIndex) => {
            setOffset(limit * pageIndex);
          }}
        />
      </Card>
    </Box>
  );
});

export default ExternallyPaginatedTableCard;
