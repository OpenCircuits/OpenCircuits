# Digital Internal (`internal`)

This directory houses the internal logic specific to the digital circuit model. Rather than simply extending the generic shared engine, its primary purpose is to *implement* the concrete digital objects (components, ports, wires) along with their visual view assemblers. Additionally, it defines the completely digital-specific `Simulator` object, which is responsible for simulating actual circuit propagation logic and signal states.

## Sub-Directories

- **`assembly`**: Contains the visual rendering logic (`CircuitAssembler`) specifically tailored for digital components and wires, dictating how they are drawn on screen.
- **`sim`**: The digital simulation engine. Contains the state machine, runners, and propagation logic that makes the digital components function (e.g., executing an AND gate's logic).

## Files

- **`DigitalComponents.ts`**: The central registry of digital component blueprints (`DigitalObjInfoProvider`). It defines the static configuration (ports, inputs, outputs, rules) for all basic digital parts like Logic Gates, Flip-Flops, Inputs/Outputs (LEDs, Switches), and complex components (Multiplexers).
