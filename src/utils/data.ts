import { isEmpty, omitBy } from 'lodash';

import { formatBytes } from './bytes';

export const diff = (
  updatedData: any,
  originalData: any,
  biDirectional = false
) => {
  const dataDiff: any = omitBy(updatedData, (value, key) => {
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

export const getMemorySize = (object: any, formatted = false) => {
  let bytes = 0;
  if (object !== null && object !== undefined) {
    switch (typeof object) {
      case 'number':
        bytes += 8;
        break;
      case 'string':
        bytes += object.length * 2;
        break;
      case 'boolean':
        bytes += 4;
        break;
      case 'object':
        const objectClass = Object.prototype.toString.call(object).slice(8, -1);
        if (objectClass === 'Object' || objectClass === 'Array') {
          for (const key in object) {
            if (!object.hasOwnProperty(key)) continue;
            bytes += getMemorySize(object[key]) as number;
          }
        } else {
          bytes += object.toString().length * 2;
        }
        break;
    }
  }
  return formatted ? formatBytes(bytes) : bytes;
};
