# Circuit Designer Utilities (`utils`)

This directory contains standalone utility functions to assist with circuit designer interactions and rendering.

## Files

- **`SnapUtils.ts`**: Contains functions for aligning object positions. `SnapToGrid` handles snapping to the global background grid, while `SnapToConnections` handles automatically aligning components along the X or Y axis with the ports they are connected to.
- **`ToSVGDrawing.ts`**: A helper function that decodes base64 SVG strings, parses the XML, and converts them into `SVGDrawing` objects (using the `svg2canvas` library) so they can be drawn natively on an HTML Canvas.
