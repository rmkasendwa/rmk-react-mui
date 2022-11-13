import 'flag-icons/css/flag-icons.min.css';

import Box, { BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';

import { CountryCode } from '../interfaces/Countries';
import FieldValue, { FieldValueProps } from './FieldValue';

export interface CountryFieldValueProps {
  countryCode: CountryCode;
  countryLabel: string;
  FieldValueProps?: Partial<FieldValueProps>;
  FlagIconProps?: Partial<BoxProps>;
}

export const CountryFieldValue = forwardRef<
  HTMLDivElement,
  CountryFieldValueProps
>(function CountryFieldValue(
  { countryCode, countryLabel, FieldValueProps = {}, FlagIconProps = {} },
  ref
) {
  const { sx: FieldValuePropsSx, ...FieldValuePropsRest } = FieldValueProps;
  const { sx: FlagIconPropsSx, ...FlagIconPropsRest } = FlagIconProps;

  return (
    <FieldValue
      ref={ref}
      {...FieldValuePropsRest}
      icon={
        <Box
          {...FlagIconPropsRest}
          className={`fi fi-${countryCode.toLowerCase()}`}
          sx={{
            fontSize: 20,
            height: '1em',
            ...FlagIconPropsSx,
          }}
        />
      }
      sx={{
        flexWrap: 'nowrap',
        alignItems: 'center',
        ...FieldValuePropsSx,
      }}
    >
      {countryLabel}
    </FieldValue>
  );
});

export default CountryFieldValue;
