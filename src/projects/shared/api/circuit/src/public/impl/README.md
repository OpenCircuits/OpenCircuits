# Public API Implementations (`public/impl`)

This directory contains the concrete implementations of the public interfaces (defined one level up). These classes act as safe, object-oriented wrappers around the raw, internal `CircuitDocument` data model, providing an easy-to-use API for application code (like rendering views or UI controllers).

## Architecture

At the core of this pattern is the `CircuitContext` (found in `CircuitContext.ts`). It holds references to the `CircuitInternal` (the engine), the `CircuitAssembler` (the renderer data), and a factory. Every API wrapper class (like `ComponentImpl` or `WireImpl`) receives this context, allowing them to independently query the engine, calculate bounds, or spawn other wrapped objects without needing complex back-references.

## Files

Most files in this directory are the concrete implementations (`...Impl`) of the interfaces defined in the parent `public` directory.

- **`BaseObject.ts`**: Implements the base functionality for all API wrapper objects.
- **`Camera.ts`**: The concrete implementation for the Camera public interface.
- **`Circuit.ts`**: The concrete implementation for the Circuit public interface.
- **`Component.ts`**: The concrete implementation for the Component public interface.
- **`ComponentInfo.ts`**: The concrete implementation for the ComponentInfo public interface.
- **`History.ts`**: The concrete implementation for the History public interface.
- **`IntegratedCircuit.ts`**: The concrete implementation for the IntegratedCircuit public interface.
- **`ObjContainer.ts`**: The concrete implementation for the ObjContainer public interface.
- **`Port.ts`**: The concrete implementation for the Port public interface.
- **`Selections.ts`**: The concrete implementation for the Selections public interface.
- **`Wire.ts`**: The concrete implementation for the Wire public interface.
- **`CircuitContext.ts`**: Defines the `CircuitContext` and `CircuitAPIFactory` used to inject dependencies (the engine, assembler, and object factory) into all API wrapper objects.
- **`Types.ts`**: Contains complex TypeScript definitions (`CircuitTypes`, `CircuitAPITypes`) used to heavily template the entire API. This allows downstream projects (like the digital or analog implementations) to seamlessly inject their own strongly-typed interfaces (e.g., `DigitalComponent`) while maintaining the shared API logic.
