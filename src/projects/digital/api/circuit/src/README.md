# Digital Circuit API

This module contains the core data model, simulation engine, and public API for the OpenCircuits Digital Simulator.

It extends the generic node-graph engine from the `shared` module to create a fully-featured digital electronics simulator.

## The Digital Model

While the `shared` engine handles generic objects, grouping, and connections, the digital engine transforms this generic framework into a functional, stateful simulation by adding four key enhancements:

### 1. Directed Data Flow (Input/Output Ports)
It classifies all generic ports as explicitly **Input ports** or **Output ports**. This fundamentally transforms the undirected generic graph into a directed graph, establishing a clear path for logical flow.

### 2. Signals
Ports are extended to hold **Signals** (e.g., `On`, `Off`, `Metastable`). These signals represent the current state of the digital logic flowing through the wires and connections at any given moment.

### 3. Component State
Components are extended to hold their own **internal logical state**. This allows for the creation of sequential logic components, like a D-Latch or Flip-Flop, which remember their state across simulation cycles.

### 4. The Digital Simulator
It introduces an overarching **Digital Simulator** object. This engine actively "runs" the circuit by reading input signals, executing component logic, updating internal component states, and propagating new signal states across the graph.

## Directory Map

- **`schema/`**: Digital-specific JSON data definitions, including the `DigitalCircuit` configuration and `DigitalSimState`.
- **`internal/`**: The core simulation engine. Contains the static blueprints for all components (`DigitalComponents.ts`), the visual rendering layer (`assembly/`), and the logic propagation state machine (`sim/`).
- **`public/`**: The safe, object-oriented API wrappers (`DigitalCircuit`, `DigitalComponent`, `DigitalPort`) that expose digital-specific functionality (like querying a port's boolean signal) to the UI.
- **`utils/`**: Utility functions tailored for digital logic, such as binary-coded decimal (BCD) conversions.
