# Digital Public API Implementations (`public/impl`)

This directory contains the concrete implementations of the digital interfaces defined in the parent `public` directory.

## Structure

Just like the `shared` API, these classes act as safe, object-oriented wrappers around the raw, internal `DigitalSimState` and `CircuitDocument` data models. They are instantiated by the `DigitalCircuitContext` and injected with the digital engine and assembler dependencies, allowing them to provide fully-featured, domain-specific methods to the UI layer.

## Files

- **`DigitalCircuit.ts`**, **`DigitalComponent.ts`**, **`DigitalPort.ts`**, etc.: Concrete classes implementing the `public` interfaces of the same name.
- **`DigitalCircuitContext.ts`**: The dependency injection container for the digital domain, linking the engine, assembler, and component factories.
- **`DigitalObjContainer.ts`**, **`DigitalSelections.ts`**: Implementations for grouping and selecting digital objects.
