# Tool Renderers (`tools/renderers`)

This directory contains the classes responsible for rendering the temporary, visual feedback states associated with interactive tools.

## Architecture

While the `assembly` layer handles drawing the concrete, persistent circuit objects (Components, Wires, Ports), the active `Tool` often needs to draw ephemeral guides that only exist while the tool is active. These renderers hook into the `Viewport`'s render loop to draw those temporary graphics over the circuit.

## Files

- **`ToolRenderer.ts`**: The base interface for a tool renderer.
- **`WiringToolRenderer.ts`**: Draws the "ghost" wire that follows the user's cursor while they are actively dragging a new connection from a port.
- **`SelectionBoxToolRenderer.ts`**: Draws the translucent blue bounding box that appears when dragging to select multiple items.
- **`RotateToolRenderer.ts`**: Draws the rotational guidelines and snapping angles while a user is spinning a component.
