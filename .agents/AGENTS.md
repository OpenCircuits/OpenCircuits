# OpenCircuits AI Agent Guidelines

## Repository Structure & Boundaries
- **Monorepo Architecture**: This codebase is structured as a monorepo spanning multiple domains.
- **`src/projects/`**: The core simulators. Contains `analog`, `digital`, and `shared` (common logic that affects both).
- **`src/server/`**: The backend server written in Go.
- **`src/other/pages/`**: The React frontends for the `landing` site and `docs` site.
- **`docs/`**: The actual markdown documentation content for the docs site.
- **`scripts/`**: Custom Node.js scripts for building, testing, and Dockerfiles for WASM compilation.
- **Local Documentation**: `README.md` files exist throughout the directory tree. Always read them for vital context on local architecture and boundaries before making changes.

## Core Commands
- **Building**: `yarn build` (interactive) or `yarn build:prod src/projects/digital/site` etc.
- **Testing**: `yarn test --ci <path>` (e.g., `yarn test --ci src/projects/analog/api/circuit`). Always use the `--ci` flag for agent environments.
- **Linting**: `yarn lint:all`.
- **Scripts**: If you edit any files in the `scripts/` directory, you must re-run `yarn postinstall` to compile them, otherwise the changes won't be picked up.

## Coding Standards
- **Strict Typing**: The use of `any` is strictly forbidden across the TypeScript codebase.
- **Reference Existing Patterns**: Never write code without first checking the rest of the codebase for examples or similar scenarios. Always emulate established patterns (this applies especially strongly to tests).
- **Update Documentation**: Any updates to code, including the addition or removal of files, must always be reflected in the nearest `README.md` file to keep the architecture documentation accurate.
