# Public API (`public`)

This directory contains the public interfaces and type definitions for the shared circuit API. These interfaces define the contract that applications (and downstream projects like digital/analog APIs) use to interact with circuits without being coupled to the internal engine logic.

## Sub-Directories

- **`impl`**: Contains the concrete implementation classes for these interfaces, providing the actual wrapper objects that manage dependencies (like the `CircuitContext`) and delegate calls to the `CircuitInternal` engine.

## Files

- **`BaseObject.ts`**: Defines a generic base interface providing common functionality (like `id`, `bounds`, `isSelected`, and custom property management) for all wrapper objects.
- **`Camera.ts`**: Defines the interface for the camera state, providing methods to pan/zoom and emitting events when changed.
- **`Circuit.ts`**: Defines the main API orchestrator (`Circuit`). It manages the entire circuit, handling transactions, spatial queries (like `pickObjAt`), providing access to history and selections, and acting as the gateway for creating or deleting objects and Integrated Circuits.
- **`Component.ts`**: Defines the interface for Components (and `Node`s). Exposes methods to mutate position, access available `ports`, or replace/delete the component.
- **`ComponentInfo.ts`**: Defines the read-only interface for querying a component type's static configuration (e.g. valid port configurations and rules).
- **`History.ts`**: Defines a read-only interface around the internal event log, exposing an `undo` and `redo` stack for the UI to display.
- **`IntegratedCircuit.ts`**: Defines interfaces for ICs, providing access to their internal schema (components/wires) and manipulating their display size and pin metadata.
- **`Obj.ts`**: Defines the `Obj` union type representing any of the basic circuit objects.
- **`ObjContainer.ts`**: Defines a highly utilized interface around a collection of objects. It provides bulk operations (e.g., `select()`, `shift()`), queries (`bounds`, `midpoint`), and powerful connection expansions (`withWiresAndPorts()`).
- **`Port.ts`**: Defines the interface for a Port. Exposes spatial data (`originPos`, `targetPos`) and connectivity helpers (`isAvailable`, `canConnectTo`, `connectTo`, `connectedPorts`).
- **`Selections.ts`**: Defines the interface for the current selection state, maintaining an `ObjContainer` of currently selected objects and firing events when the selection count changes.
- **`Utilities.ts`**: Contains handy TypeScript type-guard functions (`isComponent`, `isWire`, `isPort`) for differentiating objects at runtime.
- **`Wire.ts`**: Defines the interface for a Wire. Exposes its geometric `shape` (a `Curve`), its full node-traversing `path`, and methods to `split()` or `delete()` it.
- **`index.ts`**: The main export barrel for the public API interfaces.
