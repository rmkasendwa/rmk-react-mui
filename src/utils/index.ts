export const removeNullValues = (object: Record<string, any>) => {
  return Object.keys(object)
    .filter((key) => {
      return object[key] != null;
    })
    .reduce((accumulator, key) => {
      accumulator[key] = object[key];
      return accumulator;
    }, {} as Record<string, any>);
};
