# Digital Rendering Assets (`rendering`)

This directory provides the base visual assets used when assembling the visual primitives for digital components.

## Files

- **`svgs/`**: Contains raw `.svg` files for standard logic gates (AND, OR, NOT, XOR), switches, buttons, and constant sources.
- **`svgs/index.ts`**: Uses the `ToSVGDrawing` utility from the `shared` designer to parse the raw SVG strings into standard `SVGDrawing` objects that the canvas renderers can draw.
