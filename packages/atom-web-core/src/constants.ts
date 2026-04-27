// Environment flags — uses process.env.NODE_ENV which works in Node, Vite, and Vitest.
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";
