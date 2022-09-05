import { generateUtilityClass, generateUtilityClasses } from '@mui/material';

export interface FieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldValueClassKey = keyof FieldValueClasses;

export function getFieldValueUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValue', slot);
}

const fieldValueDisplayClasses: FieldValueClasses = generateUtilityClasses(
  'MuiFieldValue',
  ['root']
);

export default fieldValueDisplayClasses;
