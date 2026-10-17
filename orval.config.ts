import { defineConfig } from "orval";

export default defineConfig({
  blogApi: {
    input: {
      target: "http://127.0.0.1:8000/docs/api.json",
    },
    output: {
      target: "./lib/api/generated/blog-api.ts",
      schemas: "./lib/api/generated/models",
      client: "react-query",
      mode: "tags-split",
    },
  },
});