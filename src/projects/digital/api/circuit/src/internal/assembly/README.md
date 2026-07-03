# Digital Assembly (`internal/assembly`)

This directory contains the view-layer assembly engines tailored for the digital simulation. It maps abstract digital schema objects into spatial geometric primitives for rendering.

## Files
- **`DigitalCircuitAssembler.ts`**: The main assembler for digital circuits. It extends the core assembler to provide the `DigitalSimState` to individual component assemblers, allowing them to render differently based on the simulation state (e.g., an LED glowing when its input signal is `On`).
- **`DigitalWireAssembler.ts`**: The assembler for digital wires. It renders the wire's color or state based on the digital signal flowing through it (e.g., bright green for `On`, dark green for `Off`, red for `Metastable`).

## Sub-Directories
- **`components/`**: Contains the individual `Assembler` strategies for every specific digital component (gates, flip-flops, inputs, outputs, etc.).
