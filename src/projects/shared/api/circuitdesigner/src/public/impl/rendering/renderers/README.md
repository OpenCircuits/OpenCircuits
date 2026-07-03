# Renderers (`public/impl/rendering/renderers`)

This directory contains the classes that execute the actual drawing logic for different visual layers of the circuit designer canvas.

## Files

- **`PrimRenderer.ts`**: The core renderer that maps the abstract geometric primitives (e.g., `Rectangle`, `Circle`, `BezierCurve`) produced by the `assembly` layer into concrete HTML Canvas drawing calls using the `RenderHelper`.
- **`GridRenderer.ts`**: Responsible for rendering the background grid pattern (dots or lines) based on the camera's current zoom and position.
- **`DebugRenderer.ts`**: Responsible for rendering debug overlays, such as component bounding boxes or spatial query hit-boxes, when debug options are enabled.
