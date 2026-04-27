# atom-web

A monorepo of shared frontend packages for use across projects. All packages
are scoped to `@hwndmaster` and published to GitHub Packages.

---

## Package structure

| Package | Purpose |
|---|---|
| [`atom-web-core`](packages/atom-web-core) | Standalone core utilities — logger, helpers, entity ID, constants, loading targets. No React or Axios dependencies. |
| [`atom-api-core`](packages/atom-api-core) | Axios-based API utilities — `ApiClientBase`, `ApiResponse`, `AxiosInstanceFactory`. |
| [`atom-api-nswag`](packages/atom-api-nswag) | NSwag Liquid templates for generating TypeScript clients. No build step; templates are consumed directly. |
| [`atom-react-core`](packages/atom-react-core) | Framework-agnostic React components and utilities — `CircularProgress`, `LoadingSpinner`, route helpers, Zod reference schemas. No PrimeReact dependency. |
| [`atom-react-prime`](packages/atom-react-prime) | PrimeReact-based components — `ToastProvider`, `toastService`, form components (`FormInputText`, `FormDropdown`, etc.). |
| [`atom-react-redux`](packages/atom-react-redux) | Redux store factory (`createAppStore`), `callApi` saga builder, `withLoading`/`withCallback` saga utilities, common slice (loader state, error handling). |
| [`atom-testing-utils`](packages/atom-testing-utils) | Test utilities — `SagaRunner`, `FakeAxios`, `FakeLogger`, `renderWithProviders`, `createFakeStore`, `fakeRouterHistory`. |
| [`atom-eslint-common`](packages/atom-eslint-common) | ESLint flat config — TypeScript, JSDoc, import-x rules. |
| [`atom-eslint-stylistic`](packages/atom-eslint-stylistic) | ESLint flat config — indent (4 spaces), quotes (double), naming-convention rules. |
| [`atom-eslint-react`](packages/atom-eslint-react) | ESLint flat config — React hooks, Vitest, testing-library rules. Exports `reactConfig` and `reactTestConfig`. |

---

## Changesets — versioning and changelogs

This repo uses [Changesets](https://github.com/changesets/changesets) to manage package versions and generate changelogs.

### How it works

- Every meaningful change to a package should be accompanied by a **changeset** — a small markdown file that describes what changed and whether it's a `patch`, `minor`, or `major` bump.
- On merge to `master`, the [release workflow](.github/workflows/release.yml) either:
  - Opens a **Release PR** that accumulates pending changesets into a version bump and changelog update, OR
  - **Publishes** the packages automatically if the Release PR was the last merged PR.

### Adding a changeset

After making changes to one or more packages, run:

```bash
pnpm changeset
```

The interactive CLI will ask which packages changed and how significant the change is (`patch` / `minor` / `major`). A markdown file is created in `.changeset/`. Commit it alongside your code changes.

### Changeset severity guide

| Bump | When to use |
|---|---|
| `patch` | Bug fix, internal refactor, no API change |
| `minor` | New exported function/component, backward-compatible addition |
| `major` | Breaking API change, removed export, changed function signature |

---

## Install, build, and test

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ — install via `npm install -g pnpm`

### One-time authentication setup

The `.npmrc` in this repo references `${GITHUB_TOKEN}` as a placeholder. Place the actual token in your **user-level `.npmrc`** (`C:\Users\<you>\.npmrc` on Windows, `~/.npmrc` on Mac/Linux) so it is never committed:

```ini
//npm.pkg.github.com/:_authToken=ghp_your_token_here
```

Create the file if it doesn't exist. Once done, `pnpm install` will authenticate automatically in both `atom-web` and any consuming project (e.g. `prepper-box`).

To create a token: go to **GitHub → Settings → Developer settings → Personal access tokens** and create a Classic PAT with `read:packages` (for installing) and `write:packages` (for publishing) scopes.

### Install dependencies

```bash
pnpm install
```

### Build all packages

```bash
pnpm build
```

This runs `tsup` in each compiled package (all except the ESLint config packages and `atom-api-nswag` which have no build step).

### Build a single package

```bash
pnpm --filter @hwndmaster/atom-web-core build
```

### Run all tests

```bash
pnpm test
```

### Run tests for a single package

```bash
pnpm --filter @hwndmaster/atom-testing-utils test
```

---

## Creating a new version and releasing

### Step 1 — add a changeset

With your changes committed:

```bash
pnpm changeset
```

Follow the prompts and commit the generated `.changeset/*.md` file.

### Step 2 — merge to master

Push your branch and open a PR. When it's merged to `master`:

- The CI workflow (`ci.yml`) runs build + tests.
- The release workflow (`release.yml`) runs the Changesets action, which either:
  - Creates or updates a **"Version Packages"** PR with bumped `package.json` versions and updated `CHANGELOG.md` files for every affected package.
  - If the "Version Packages" PR is the one being merged, it publishes all changed packages to GitHub Packages automatically.

### Step 3 — merge the Version Packages PR

Review and merge the auto-generated Version Packages PR. The publish step runs automatically.

### Manual publish (emergency only)

```bash
pnpm install
pnpm build
pnpm changeset version   # bumps package.json versions
pnpm changeset publish   # publishes to GitHub Packages
```

Requires a `NODE_AUTH_TOKEN` environment variable set to a GitHub PAT with `write:packages` scope.

---

## Adding a new package

1. Create `packages/<name>/` with:
   - `package.json` (name `@hwndmaster/<name>`, version `0.1.0`)
   - `tsconfig.json` extending `../../tsconfig.base.json`
   - `tsup.config.ts` with `entry: ["src/index.ts"]`, `format: ["esm", "cjs"]`, `dts: true`
   - `src/index.ts` as the public entry point
2. Run `pnpm install` at the root to link the workspace.
3. Add a changeset for the new package (`pnpm changeset`, select `patch` for the first release).
