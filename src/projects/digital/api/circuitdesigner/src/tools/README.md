# Digital Tools (`tools`)

This directory contains interactive `Tool`s and atomic `ToolHandler`s specifically built for digital circuit features.

## Files

- **`ICPortTool.ts`**: An interactive tool that handles dragging, moving, and re-ordering connection ports on an Integrated Circuit (IC).
- **`ICResizeTool.ts`**: An interactive tool that handles clicking and dragging the edges of an Integrated Circuit to resize its visual footprint on the canvas.

## Sub-Directories

- **`handlers/`**: Contains atomic handlers like the `InteractionHandler.ts`, which listens for mouse clicks on interactive digital components (like toggling a switch or pressing a button) and modifies their internal logic state accordingly.
