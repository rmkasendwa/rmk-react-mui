export const getInterpolatedPath = (
  routePath: string,
  params: Record<string, string | number | boolean>
): string => {
  const regex = /:(\w+)/g;
  const extractedParameters = [];
  let match;
  do {
    match = regex.exec(routePath);
    match && extractedParameters.push(match[1]);
  } while (match);
  extractedParameters
    .filter((key) => !key.match(/^\d+$/g))
    .forEach((key) => {
      if (!params[key]) {
        throw new Error(`Param ${key} not found`);
      }
      routePath = routePath.replace(`:${key}`, encodeURIComponent(params[key]));
    });
  return routePath;
};

export const paramsSufficientForPath = (
  routePath: string,
  params: Record<string, string | number | boolean>
) => {
  const regex = /:(\w+)/g;
  const extractedParameters = [];
  let match;
  do {
    match = regex.exec(routePath);
    match && extractedParameters.push(match[1]);
  } while (match);
  return extractedParameters
    .filter((key) => !key.match(/^\d+$/g))
    .every((key) => {
      if (!params[key]) {
        return false;
      }
      return true;
    });
};

export const addSearchParams = (
  routePath: string,
  params: Record<string, string | number | undefined>
): string => {
  const keys = Object.keys(params);
  if (keys.length === 0) return routePath;
  return (
    routePath +
    '?' +
    keys
      .reduce((accumulator, key) => {
        if (params[key]) {
          const value = (() => {
            if (Array.isArray(params[key])) {
              return (params[key] as any).join(',');
            }
            return String(params[key]);
          })();
          accumulator.push(`${key}=${encodeURIComponent(value)}`);
        }
        return accumulator;
      }, [] as string[])
      .join('&')
  );
};
