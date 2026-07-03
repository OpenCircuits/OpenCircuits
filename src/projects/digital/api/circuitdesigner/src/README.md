# Digital Circuit Designer

This directory contains the `digital` extensions to the generic `shared` Circuit Designer API.

While the shared designer provides a blank canvas, tool orchestration, and generic movement/wiring logic, this module injects the concrete details needed specifically for digital circuit simulation and design.

## Architecture

This module implements a specific instance of the `CircuitDesigner` wrapper, injecting the digital tool configurations and text measurement utilities. 

## Directory Map

- **`DigitalCircuitDesigner.ts`**: The factory function (`CreateDesigner`) that constructs a `CircuitDesignerImpl` configured with the digital component SVGs and digital `ToolConfig`.
- **`rendering/`**: Contains raw SVG assets used by the view assemblers to draw basic digital logic shapes (like AND/OR gates).
- **`tools/`**: Contains digital-specific interactive `Tool`s and `ToolHandler`s (e.g., tools for editing ICs or interacting with buttons/switches).
