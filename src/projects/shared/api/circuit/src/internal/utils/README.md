# Internal Utilities (`utils`)

This directory contains small, internal utility functions used by the core model and implementation layers.

## Files

- `Debug.ts`: Provides helper functions (like `GetShortenedID` and `GetDebugInfo`) for generating readable string representations of circuit objects for debugging and logging.
- `TypeEnforcement.ts`: Contains the `assertNever` utility function used to enforce exhaustive type checking at compile-time (typically within `switch` statements over union types like `CircuitOp`).
