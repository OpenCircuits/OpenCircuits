# Circuit Designer Implementations (`public/impl`)

This directory contains the concrete implementations for the Circuit Designer module, serving as the bridge between the logical circuit models and the visual Canvas interaction layer.

## Files

- **`CircuitDesigner.ts`**: The concrete implementation of the `CircuitDesigner` interface. It ties together the `Viewport`, the `ToolManager`, and the underlying `Circuit` model.
- **`Viewport.ts`**: The concrete implementation of the `Viewport` interface. It implements the rendering loop, handles interactions with the underlying `HTMLCanvasElement`, processes resizing, manages the camera transformations, and delegates rendering to the `RenderHelper`.
- **`ToolManager.ts`**: An orchestration class that receives raw user input events (like clicks or drags) and determines which `Tool` should be activated, deactivated, or updated based on those interactions.
- **`DebugOptions.ts`**: A configuration class used to toggle visual debugging tools (like drawing bounding boxes or grid lines).

## Sub-Directories

- **`rendering/`**: Contains the lower-level abstraction classes for actually drawing to an HTML Canvas. It includes `RenderHelper` (the main drawing wrapper), `RenderScheduler` (for managing animation frames), and individual primitive renderers.
