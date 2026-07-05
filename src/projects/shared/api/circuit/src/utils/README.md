# Utilities (`utils`)

This directory contains a collection of generic utility data structures, polyfills, and helpers that are used throughout the shared circuit API. These utilities are generally not circuit-specific (with the exception of `CircuitUtils`), and provide robust paradigms like Rust-style Result/Option types and the Observer pattern.

## Sub-Directories

- **`math`**: Contains geometric and mathematical utility classes (like `Curve`, `Rect`, `Transform`, `Matrix`, `Vector`, etc.) used heavily by the assembler and spatial query logic.

## Files

- **`Array.ts`**: Provides global polyfills and extension methods for JavaScript's `Array` (e.g. `sum`, `zip`, `chunk`).
- **`CircuitUtils.ts`**: Contains `CreateGraph` which converts a `Circuit` into a topological `Graph` where nodes are components and edges are wires.
- **`DirtyVar.ts`**: A wrapper for a lazily-evaluated cached variable that can be manually marked as dirty, forcing it to recalculate upon the next fetch.
- **`Functions.ts`**: Provides generic functions for mapping and manipulating standard JavaScript objects/records (e.g. `MapObj`, `FilterObj`).
- **`Map.ts`**: Provides global polyfills for JavaScript's `Map` type, adding helpful methods like `emplace` and `getOrInsert`.
- **`MultiError.ts`**: Implements a custom `Error` type (`MultiError`) that encapsulates an array of multiple errors with their corresponding stack traces.
- **`Observable.ts`**: Defines the `Observable` interface and implementation (`ObservableImpl`, `MultiObservable`) representing the generic publisher-subscriber event pattern.
- **`Reducers.ts`**: Small utility reducer functions (like `MinDist` for finding objects by minimal distance).
- **`Result.ts`**: A robust, Rust-inspired implementation of the `Result` and `Option` monadic types, enabling safe and chainable error handling (using `map`, `unwrap`, `match`, etc.).
- **`StringUtils.ts`**: Basic string helper functions (`SubStrEquals`).
- **`types.ts`**: TypeScript type-level utilities like `DOmit` (Distributed Omit) and a function for running an array of cleanup functions.
