# OpenCircuits Core Architecture

This directory (`src/projects/`) holds each of the OpenCircuits projects (digital & analog), while also providing the shared core library of OpenCircuits. It houses the decoupled architecture that separates the raw circuit logic, interaction layers, and the entire actual frontend sites.

## Directory Map

- **`shared/`**: Generic, foundational logic applicable to any circuit type, as well as shared frontend site components.
- **`digital/`**: Digital-specific extensions and the digital simulation frontend site.
- **`analog/`**: *(WIP)* Analog-specific extensions and the analog simulation frontend site.

## Core Architecture

Within each domain, the code is split into two primary layers:

- **API (`api/`)**: The pure mathematical models, simulation engines, and interaction layers.
  - **Circuit (`api/circuit/`)**: The pure, logic-less representation of the circuit. Handles raw data structures, state management, and mathematical assembly without any concept of a UI.
  - **Circuit Designer (`api/circuitdesigner/`)**: The intermediate "canvas layer" between the raw logic and the frontend. Provides an isolated environment for managing spatial interactions, tools, and rendering.
- **Site (`site/`)**: The actual frontend application that mounts the `CircuitDesigner` and provides the full web UI (DOM, React, menus, toolbars).
