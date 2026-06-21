# Tool Handlers (`tools/handlers`)

This directory contains `ToolHandler` classes. Unlike `Tool`s, which manage continuous, multi-step interactive states (like dragging), Handlers are responsible for instantaneous, atomic actions that happen in a single event frame (typically key presses).

## Architecture

When the `ToolManager` has no active `Tool`, it routes input events to the `DefaultTool`. The `DefaultTool` iterates through its configured array of `ToolHandler`s. If a handler recognizes the event (e.g., the `DeleteHandler` sees the 'Backspace' key was pressed), it executes its logic and halts the event propagation.

## Files

- **`ToolHandler.ts`**: Defines the base `ToolHandler` interface and the `ToolHandlerResponse` enum (which indicates if the event should be halted or passed to the next handler).
- **`UndoHandler.ts` / `RedoHandler.ts`**: Listens for 'Ctrl+Z' / 'Ctrl+Y' to trigger history traversal.
- **`CopyHandler.ts` / `PasteHandler.ts` / `DuplicateHandler.ts`**: Listens for clipboard shortcuts ('Ctrl+C', 'Ctrl+V', 'Ctrl+D') to manage the cloning of components.
- **`DeleteHandler.ts`**: Listens for 'Backspace' or 'Delete' to remove the currently selected objects.
- **`SelectAllHandler.ts` / `DeselectAllHandler.ts` / `SelectionHandler.ts`**: Handles clicking to select individual items or using 'Ctrl+A' to select everything.
- **`ZoomHandler.ts` / `FitToScreenHandler.ts`**: Handles mouse-wheel zooming and the 'F' key shortcut to fit the camera to the circuit bounds.
- **`SaveHandler.ts`**: Listens for 'Ctrl+S'.
- **`SelectPathHandler.ts`**: Listens for double-clicking a wire to select the entire path.
- **`CleanupHandler.ts`**: Triggers routines to clean up stray wires or invalid states.
- **`SnipNodesHandler.ts`**: Triggers routines to remove unnecessary intermediary nodes on straight wire paths.
