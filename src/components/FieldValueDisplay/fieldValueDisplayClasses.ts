import { generateUtilityClass, generateUtilityClasses } from '@mui/material';

export interface FieldValueDisplayClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldValueDisplayClassKey = keyof FieldValueDisplayClasses;

export function getFieldValueDisplayUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValueDisplay', slot);
}

const fieldValueDisplayClasses: FieldValueDisplayClasses =
  generateUtilityClasses('MuiFieldValueDisplay', ['root']);

export default fieldValueDisplayClasses;
