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
- **Formatting**: `yarn fmt:check` to check and `yarn fmt` to execute the formatting.
- **Linting**: `yarn lint`.

## Coding Standards
- **Strict Typing**: The use of `any` is strictly forbidden across the TypeScript codebase.
- **Reference Existing Patterns**: Never write code without first checking the rest of the codebase for examples or similar scenarios. Always emulate established patterns (this applies especially strongly to tests).
- **Update Documentation**: Any updates to code, including the addition or removal of files, must always be reflected in the nearest `README.md` file to keep the architecture documentation accurate.

### Testing Guidelines
- **Integration over Isolation**: When testing UI behavior or bugs tied to application state (e.g., Redux, global hooks), strongly prefer integration tests that simulate real user interactions (rendering connected components with providers and using `userEvent.click`) rather than testing hooks or state in artificial isolation.
- **Avoid Mocks for Core Logic**: Do not mock internal APIs or complex structures (like the `Circuit` class or `CircuitHistory`). Use the real implementations and canonical test helpers (e.g., `CreateTestCircuit()`, `CircuitHelpers`) to ensure the tests interact with the genuine architecture of the system.
