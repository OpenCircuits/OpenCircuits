# Digital Public API (`public`)

This directory defines the public-facing TypeScript interfaces for the digital circuit API. It extends the generic `shared` circuit API interfaces to expose digital-specific functionality (like checking the boolean signal of a port) directly to consumers (such as the UI).

## Files

- **`DigitalCircuit.ts`**: Defines the `DigitalCircuit` interface, extending the base `Circuit` with methods to interact with the digital simulation (e.g., getting the `sim` runner).
- **`DigitalComponent.ts`**: Defines the `DigitalComponent` interface, extending the base `Component` with potential digital-specific mutations or type narrowing.
- **`DigitalComponentInfo.ts`**: Defines the `DigitalComponentInfo` interface, providing static blueprints for digital components.
- **`DigitalPort.ts`**: Defines the `DigitalPort` interface, extending the base `Port` to include methods for querying the current `Signal` flowing through it.
- **`DigitalSim.ts`**: Exposes public interfaces for interacting with the simulation runner (e.g., Play, Pause, Set Tick Rate).
- **`DigitalWire.ts`**: Defines the `DigitalWire` interface.
- **`Utilities.ts`**: Contains helpful type-guards (`isDigitalComponent`, `isDigitalPort`, etc.) to narrow generic objects into their digital counterparts at runtime.

## Sub-Directories

- **`impl/`**: Contains the concrete implementation classes for all the interfaces defined in this directory.
