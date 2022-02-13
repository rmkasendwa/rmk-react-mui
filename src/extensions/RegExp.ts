declare global {
  interface RegExpConstructor {
    escape: (s: string) => string;
  }
}

RegExp.escape = (inputString) => {
  return inputString.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export {};
