// utils/cache.ts
const cache: Record<string, any> = {};

export const setCache = (key: string, value: any) => {
  cache[key] = value;
};

export const getCache = (key: string) => {
  return cache[key];
};

export const clearCache = () => {
  for (const key in cache) {
    delete cache[key];
  }
  console.log("Cache cleared at:", new Date().toLocaleTimeString());
};
