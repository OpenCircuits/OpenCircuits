# Assembly (`assembly`)

This directory bridges the gap between the purely logical circuit schema model and the view layer. The "Assembly" step takes objects like `Component`s, `Wire`s, and `Port`s and transforms them into a collection of geometric shapes and styles known as primitives (`Prim`s). 

By decoupling assembly from rendering, the core API can perform efficient spatial queries (like bounding box calculations and hit testing) in a head-less environment, while providing a clean array of renderable items for the actual view (e.g., a canvas).

## Core Mechanisms

- **`Assembler.ts`**: Defines the base `Assembler` class and an `AssemblyReason` enum (e.g., `TransformChanged`, `SelectionChanged`). This allows assemblers to only update the primitives that actually need updating, avoiding full re-evaluations.
- **`CircuitAssembler.ts`**: The main orchestrator. It subscribes to changes in the circuit state via diffs, tracks which objects are "dirty", triggers their respective assemblers, and maintains the `AssemblyCache`. It also exposes fast spatial queries (like `findObjsWithin` and `findNearestObj`).
- **`AssemblyCache.ts`**: Defines the caching structure used to store evaluated transforms, generated primitives, and z-index ordering for fast rendering.

## Sub-Directories

- **`common/`**: Contains concrete, reusable implementations of `ComponentAssembler` classes (like those for Labels, nodes, or static SVGs) that are shared across various component types.

## Assemblers

- **`ComponentAssembler.ts`**: An abstract base class that manages the assembly of components, allowing subclasses to define arrays of primitive blueprints (like a base shape, an SVG image, and text).
- **`PortAssembler.ts`**: Calculates local offsets and global world positions for a component's ports.
- **`WireAssembler.ts`**: Converts wire connections into visual `Line` or `BezierCurve` primitives depending on orientation.

## Primitives and Styling

- **`Prim.ts`**: Defines the renderable primitive structures (`BezierCurve`, `Circle`, `Line`, `Polygon`, `Rectangle`, `SVG`, `Text`).
- **`PrimBounds.ts`**: Contains utility functions to calculate bounding boxes (`Rect`) and oriented bounds (`Transform`) for primitives.
- **`PrimHitTests.ts`**: Contains utility functions for checking if a given point in world space is within the bounds of a primitive, and checking for intersections between a given primitive and a given rectangle.
- **`Style.ts`**: Defines visual styling interfaces like `Style`, `StrokeStyle`, and `FontStyle`.
- **`RenderOptions.ts`**: Contains the visual theme settings (colors, line widths, radiuses, default fonts) used during assembly to style the primitives.
