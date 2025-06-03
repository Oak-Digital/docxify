import { join } from "node:path";
import { parseArgs } from "node:util";
import type { BuildConfig } from "bun";
import dts from "bun-plugin-dts";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    ci: {
      type: "boolean",
    },
  },
  strict: true,
  allowPositionals: true,
});

// const isCi = values.ci ?? false;

const defaultBuildConfig: BuildConfig = {
  entrypoints: [join(__dirname, "../src/index.ts")],
  outdir: join(__dirname, "../dist"),
  packages: "external",
};

const cjsPromise = Bun.build({
  ...defaultBuildConfig,
  format: "cjs",
  naming: "[dir]/[name].cjs",
});
const esmPromise = Bun.build({
  ...defaultBuildConfig,
  plugins: [dts()],
  format: "esm",
  naming: "[dir]/[name].js",
});

const promises = [cjsPromise, esmPromise];

await Promise.all(promises);
