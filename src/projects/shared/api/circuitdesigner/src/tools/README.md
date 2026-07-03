# Tools (`tools`)

This directory defines the interactive "Tools" that process user input into continuous actions within the Circuit Designer. A `Tool` represents a stateful interaction mode (like dragging a wire or panning the camera) that activates under specific conditions, monopolizes the input stream while active, and deactivates when the action is complete.

## Architecture

The `ToolManager` listens to the raw input stream and determines which `Tool` should become active. When no specific `Tool` is active, the `DefaultTool` falls back to delegating inputs to instantaneous `ToolHandler`s.

## Files

- **`Tool.ts`**: The base interface for an interactive tool. It defines methods for state transitions (`shouldActivate`, `shouldDeactivate`), lifecycle hooks (`onActivate`, `onDeactivate`), and event processing (`onEvent`).
- **`DefaultTool.ts`**: The fallback tool that remains active when no other tool is engaged. Instead of managing a continuous state, it passes events through an array of `ToolHandler`s to trigger atomic actions.
- **`PanTool.ts`**: Handles panning the camera around the workspace when the user clicks and drags the middle mouse button.
- **`TranslateTool.ts`**: Handles picking up and dragging components around the canvas.
- **`WiringTool.ts`**: Handles the continuous action of clicking a port and dragging out a new wire to connect to another port.
- **`RotateTool.ts`**: Handles clicking and dragging the rotation handle to spin a component.
- **`SelectionBoxTool.ts`**: Handles dragging a bounding box to select multiple components at once.
- **`SplitWireTool.ts`**: Handles inserting a node into an existing wire to split it.

## Sub-Directories

- **`handlers/`**: Contains the instantaneous, atomic actions (like Undo/Redo or Copy/Paste) triggered by the `DefaultTool`.
- **`renderers/`**: Contains the view-layer renderers that draw visual feedback for the tools (like the blue selection box or the "ghost" wire being dragged).
