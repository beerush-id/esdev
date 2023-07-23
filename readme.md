# `@beerush/esdev`

A simple typescript helper to run you package development that will output ESM and CJS modules.

This package is simply run a `tsc` command with the `tsconfig.json` and `tsconfig-cjs.json` configs, and then rename
any `.js` file under `dist/cjs` folder to `.cjs` extension, and rename any **`imports`**/**`require`** endings
with `.js` to `.cjs`.

## Usage

```bash
npx @beerush/esdev
```

## Options

- **`--watch`** - Watch for changes and recompile.
- **`--clean`** - Clean the output directory before compiling.

## Requirements

- **`tsconfig.json`** file as the ESM config.
- **`tsconfig-cjs.json`** file as the CJS config.

## Install as Dev Script

```bash
npm i -D @beerush/esdev
```

```json
{
  "scripts": {
    "dev": "esdev"
  }
}
```

```bash
npm run dev
```
