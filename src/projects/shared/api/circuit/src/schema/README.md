# Schema

This directory contains the fundamental data structures and interfaces that define the core circuit schema for OpenCircuits. These types provide a pure, logic-less representation of a circuit, its components, wires, and metadata.

## Files

- **`BaseObj.ts`**: Defines the base interface for all circuit objects, containing common properties like `id` and generic `props`.
- **`Camera.ts`**: Defines the `Camera` interface representing the user's viewport position and zoom level on the circuit canvas.
- **`Circuit.ts`**: Defines the top-level `Circuit` and `IntegratedCircuit` interfaces, aggregating components, wires, ports, and metadata.
- **`CircuitMetadata.ts`**: Defines basic metadata for a circuit, such as its ID, name, and description.
- **`Component.ts`**: Extends `BaseObj` to define the schema for circuit components, including physical layout properties like position, angle, and z-index.
- **`GUID.ts`**: Provides the type definition and a utility function for generating unique identifiers (UUIDs) used across circuit objects.
- **`Obj.ts`**: Defines a union type for all concrete circuit objects (`Component`, `Wire`, `Port`) and provides a cloning utility.
- **`Port.ts`**: Extends `BaseObj` to define connection ports on components, tracking their parent component, group, and index.
- **`Prop.ts`**: Defines a basic union type (`number | string | boolean`) for acceptable property values within a circuit object.
- **`Wire.ts`**: Extends `BaseObj` to define wires that connect two Ports (`p1` and `p2`), along with visual properties like z-index and color.
- **`export.ts`**: Re-exports all the schema interfaces and types to consolidate internal imports.
- **`index.ts`**: The main entry point for the schema module, exporting everything under a `Schema` namespace.
