# Digital Component Assemblers (`internal/assembly/components`)

This directory contains the individual assembler strategies for every specific digital component. Each file here defines how a specific component (or category of components) transforms from its abstract JSON schema definition into a set of visual geometric primitives (`Rect`, `Circle`, `Text`, `Path`, etc.) that can be rendered on screen.

## Structure
- **Base Assemblers**: Contains all discrete component assemblers that aren't categorized into subfolders. This includes standard IO devices (e.g., `SwitchAssembler`, `LEDAssembler`, `ButtonAssembler`), complex standalone parts (`OscilloscopeAssembler`, `ComparatorAssembler`, `EncoderAssembler`), and basic inputs (`ClockAssembler`). These files dictate sizes, port placements, labels, and state-dependent rendering.
- **`displays/`**: Assemblers for multi-segment and complex displays (e.g., 7-segment, BCD, ASCII displays).
- **`flipflops/` & `latches/`**: Assemblers for sequential logic blocks.
- **`gates/`**: Assemblers for basic logic gates (AND, OR, XOR, etc.), typically handling varying sizes depending on input count and rendering their standard ANSI/IEEE shapes.
