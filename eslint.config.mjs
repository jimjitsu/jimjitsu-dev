import { createRequire } from "module";
const require = createRequire(import.meta.url);
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const prettier = require("eslint-config-prettier");

const config = [
  ...nextCoreWebVitals,
  prettier,
  { ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts", "public/mockServiceWorker.js"] },
];
export default config;
