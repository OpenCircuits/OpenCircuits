# Digital Simulation Engine (`internal/sim`)

This directory contains the core logic for the digital simulator. It handles executing the boolean logic of the digital components, managing state, and queuing future propagation events.

## Files
- **`DigitalPropagators.ts`**: Contains the pure logic functions (propagators) for every digital component. Given a component's current state and input signals, a propagator returns the output signals, the next state, and potentially the delay until its next execution cycle. This powers everything from simple AND gates to stateful Flip-Flops and timed Clocks.
- **`DigitalSim.ts`**: The main discrete-event simulation engine. It maintains the global `DigitalSimState` (including signals and IC states), listens to structural changes in the circuit (like adding a wire or changing a property), and uses a queue to step through the simulation cycle-by-cycle.
- **`DigitalSimRunner.ts` / `TimedDigitalSimRunner.ts`**: Runners that wrap the discrete `DigitalSim` engine into continuous or timed execution loops, providing Play/Pause functionality and controlling the tick rate.
