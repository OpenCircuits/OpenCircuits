# Assembly Common Implementations (`assembly/common`)

This directory contains concrete, reusable implementations of `ComponentAssembler` classes. In the context of the `assembly` package, an "Assembler" is responsible for translating the pure data schema (like a `Component`) into a collection of renderable "primitives" (e.g., Rectangles, Circles, Text, SVGs) that the view layer can efficiently draw.

## Files

- **`ICComponentAssembler.ts`**: Assembles Integrated Circuit components. It dynamically determines size based on IC metadata, renders a base rectangle with the IC's name, and dynamically positions the connection ports.
- **`LabelAssembler.ts`**: Assembles text label components. It dynamically calculates the required bounding box size based on the text contents and font style, rendering the text over a background rectangle.
- **`NodeAssembler.ts`**: Assembles "Node" components (typically junctions where wires split or merge) into a simple circular visual primitive.
- **`SVGComponentAssembler.ts`**: A utility base class for components that are statically sized and represented visually by a single SVG image.
- **`StaticComponentAssembler.ts`**: A foundational base class for any component assembler that has a fixed, unchanging size (avoiding the need for dynamic bounds calculation).
