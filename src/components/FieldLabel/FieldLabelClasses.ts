import { generateUtilityClass, generateUtilityClasses } from '@mui/material';

export interface FieldLabelClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldLabelClassKey = keyof FieldLabelClasses;

export function getFieldLabelUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldLabel', slot);
}

const fieldValueDisplayClasses: FieldLabelClasses = generateUtilityClasses(
  'MuiFieldLabel',
  ['root']
);

export default fieldValueDisplayClasses;
