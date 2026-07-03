# Shared Circuit Designer

The foundational canvas and interaction layer for OpenCircuits.

While the core `circuit` model represents a purely mathematical graph of objects, the **Circuit Designer** acts as an intermediate "canvas layer" between that raw logic and the frontend UI. It manages spatial interactions, rendering, and tool states independently of a full HTML DOM environment.

## Core Vocabulary

The designer is built on a few primary concepts that drive user interaction:

- **`Viewport`**: A container for the camera and canvas interactions. It translates world coordinates to screen coordinates.
- **`Tool`**: An interactive, stateful action (like wiring or panning) that processes continuous user input over multiple frames.
- **`Handler`**: An atomic, single-frame action (like undo/redo or deleting a selection) triggered by specific inputs or shortcuts.

## Directory Map

- **`public/`**: The safe, high-level API wrappers meant for external consumption (e.g., `CircuitDesigner`, `Viewport`).
- **`input/`**: The adapter system that standardizes raw browser interactions into generic input events.
- **`tools/`**: The interactive state machines, atomic handlers, and visual feedback renderers.
- **`utils/`**: Generic utilities for grid snapping and SVG parsing.
