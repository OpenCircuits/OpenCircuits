# Internal Engine (`internal`)

This directory serves as the core engine room of the shared circuit API. It contains the primary business logic, state management, and visual assembly mechanisms that power the node-based generic circuit model, all hidden behind the `internal` boundary to separate it from the public-facing API layer.

## Sub-Directories

- **`impl`**: The implementation core. Contains the authoritative `CircuitDocument` (the actual data and connectivity graph of the circuit), the event log history (`CircuitLog`), transaction operations (`CircuitOps.ts`), and the blueprints for object configurations (`ObjInfo.ts`). This is where the schema is actually manipulated and validated.
- **`assembly`**: The rendering preparation layer. This directory is responsible for transforming the pure data schema (components, wires, ports) into visual primitives (Rectangles, Circles, Lines, Curves, Text, SVG) and maintaining caching structures (`AssemblyCache`) to optimize re-rendering and facilitate spatial queries like hit-testing and bounds calculations.
- **`utils`**: Contains small internal helper functions (such as `Debug.ts` for stringifying IDs/objects and `TypeEnforcement.ts` for exhaustive union checking).

## Files

- `index.ts`: Re-exports a handful of commonly needed internal utilities and schema definitions (such as `CircuitInternal`, `GUID`, and `Prop`) for convenience.
