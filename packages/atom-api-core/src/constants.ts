import { isDev } from "@hwndmaster/atom-web-core";

export const ApiTimeoutMs = isDev === true ? 1000000 : 10000; // 1000 seconds in dev, 10 seconds in prod
