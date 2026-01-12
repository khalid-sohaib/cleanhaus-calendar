import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    "react",
    "react-native",
    "react-native-web",
    "react-native-reanimated",
    "dayjs",
    "calendarize",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  onSuccess: "tsc --emitDeclarationOnly --declaration",
});

