declare global {
  interface Object {
    merge<T extends Record<string, unknown>, U = any>(
      target: T,
      ...sources: U[]
    ): T & U;
  }
}

export {};

Object.merge = (target, ...sources) => {
  sources.forEach((source: any) => {
    Object.keys(source).forEach((key) => {
      if (typeof target[key] === 'object' && typeof source[key] === 'object') {
        Object.merge(target[key] as any, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  });
  return target as any;
};
