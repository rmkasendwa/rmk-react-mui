import { isEmpty, omit } from 'underscore';

export const diff = (
  updatedData: any,
  originalData: any,
  biDirectional = false
) => {
  const dataDiff: any = omit(updatedData, (value, key) => {
    if (originalData[key] != null && typeof originalData[key] === 'object') {
      const similar = isEmpty(diff(updatedData[key], originalData[key]));
      if (similar) return isEmpty(diff(originalData[key], updatedData[key]));
      return similar;
    }
    return originalData[key] === value;
  });
  if (biDirectional) {
    const mirrorDiff = diff(originalData, updatedData);
    for (const key in mirrorDiff) {
      if (!dataDiff[key] && mirrorDiff[key]) {
        dataDiff[key] = mirrorDiff[key];
      }
    }
  }
  return dataDiff;
};
