# Digital Circuit Schema (`schema`)

This directory contains the raw JSON data schemas specific to the digital circuit model. It extends the foundational schemas defined in the `shared` API to include digital-specific concepts like boolean logic signals and simulation state tracking.

## Files

- **`DigitalCircuit.ts`**: Extends the base `Schema.Circuit` to include global digital properties, primarily the `propagationTime` and the encapsulated simulation states (`simState` and `initialICSimStates`).
- **`DigitalSimState.ts`**: Defines the `DigitalSimState` interface which tracks the runtime state of a digital circuit. This includes mappings for port signals, internal component states, and nested IC states.
- **`Signal.ts`**: Defines the fundamental `Signal` enumeration (`Off`, `On`, `Metastable`) used throughout the digital simulator, along with utility functions for boolean conversions and state checking.
- **`export.ts` / `index.ts`**: Barrel files for exporting the schema definitions.
