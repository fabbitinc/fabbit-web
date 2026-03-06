import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "orval";

const localSpecPath = fileURLToPath(new URL("../../openapi.json", import.meta.url));
const openApiTarget = existsSync(localSpecPath) ? localSpecPath : "http://localhost:8080/openapi.json";

export default defineConfig({
  fabbit: {
    input: {
      target: openApiTarget,
    },
    output: {
      target: "./src/api/generated/orval/index.ts",
      schemas: "./src/api/generated/orval/model",
      client: "axios-functions",
      mode: "tags-split",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/orval/custom-instance.ts",
          name: "customInstance",
          extension: ".js",
        },
      },
    },
  },
});
