import { generateUtilityClass, generateUtilityClasses } from '@mui/material';

export interface TextFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TextFieldClassKey = keyof TextFieldClasses;

export function getTextFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTextField', slot);
}

const fieldValueDisplayClasses: TextFieldClasses = generateUtilityClasses(
  'MuiTextField',
  ['root']
);

export default fieldValueDisplayClasses;
