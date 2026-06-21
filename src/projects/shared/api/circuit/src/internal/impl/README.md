# Implementation (`impl`)

This directory contains the core business logic, state management, and operational mechanics that power the generic circuit model. It governs how the data schema is safely modified, tracked, and synchronized.

## Files

- **`CircuitDiff.ts`**: Accumulates a minimal, exact difference between circuit states over a sequence of operations, useful for precise history generation or minimal view updates.
- **`CircuitDocument.ts`**: The authoritative core representation of the circuit state. It handles applying operations, maintaining efficient graph connectivity maps, and providing a transactional editing interface.
- **`CircuitInternal.ts`**: A higher-level editing session wrapper around `CircuitDocument` that manages undo/redo stacks, event log synchronization, and convenience methods for mutating the circuit.
- **`CircuitLog.ts`**: Implements a distributed-system-style, one-way append-only history log (with a clock mechanism) to track changes and support remote synchronization.
- **`CircuitOps.ts`**: Defines the `CircuitOp` union type (e.g., `PlaceComponentOp`, `ConnectWireOp`) representing atomic, serializable mutations to a circuit, along with utility functions to invert or commute them.
- **`FastCircuitDiff.ts`**: A coarse, high-performance difference tracker optimized for rapidly invalidating views (like bulk-moving objects) without deep property diffing.
- **`ObjInfo.ts`**: Defines the base interfaces and structures (e.g., `ComponentConfigurationInfo`) used to create immutable "blueprints" or prototypes for specific circuit objects. Implementations of these interfaces define what properties an object has, its valid port configurations (e.g. an AND gate allowing 2 to 8 inputs), and domain-specific connection rules (e.g. preventing illegal fan-in or output-to-output connections).
