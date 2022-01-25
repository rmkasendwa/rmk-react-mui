export const addThousandCommas = (
  number: number,
  decimalPlaces?: number | boolean
) => {
  let numberString = String(number);
  if (typeof decimalPlaces === 'number') {
    numberString = number.toFixed(decimalPlaces);
  } else if (typeof decimalPlaces === 'boolean') {
    numberString = number.toFixed(2);
  }
  const numberParts: string[] = numberString.split('.');
  const wholeNumber = numberParts[0];
  const fraction = numberParts[1];
  return (
    wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (fraction !== undefined ? '.' + fraction : '')
  );
};
