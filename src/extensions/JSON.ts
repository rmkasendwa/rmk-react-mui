declare global {
  interface JSON {
    stringifyWithoutQuotes: (
      value: any,
      replacer?: ((this: any, key: string, value: any) => any) | undefined,
      space?: string | number | undefined
    ) => string;
    isValid: (string: string) => boolean;
  }
}

export {};

JSON.stringifyWithoutQuotes = function (...args) {
  return this.stringify(...args).replace(/"(\w+)"\s*:/g, '$1:');
};

JSON.isValid = (string) => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
};
