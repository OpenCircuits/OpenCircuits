# Circuit Designer Public API (`public`)

This directory defines the public-facing TypeScript interfaces for the Circuit Designer module. This module sits between the pure mathematical/generic `circuit` model and the frontend, providing an intermediate "canvas" layer that handles viewport rendering and tool interactions without requiring a full HTML DOM environment.

## Files

- **`CircuitDesigner.ts`**: Defines the central `CircuitDesigner` interface. It manages temporary session state such as the current active `Tool`, the currently pressed object, the viewport, and holds a reference to the underlying `Circuit` being edited.
- **`Viewport.ts`**: Defines the `Viewport` interface. It manages the user's `Camera`, the rendering target (e.g., an HTML Canvas), and handles coordinate translations between screen space and world space. It also provides methods for rendering primitives, resizing, and automatically fitting the camera to objects.

## Sub-Directories

- **`impl/`**: Contains the concrete implementation classes for the interfaces defined in this directory.
