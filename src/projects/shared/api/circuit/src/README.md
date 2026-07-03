# Shared Circuit API

The foundational data model and public API for OpenCircuits.

A critical aspect of the OpenCircuits architecture is that this core model is a **generic node-based graph engine** capable of representing any interconnected system. While the terminology (`Circuit`, `Wire`, `IC`) is heavily rooted in electronics to match the project's primary use-cases, the underlying structure could just as easily power a flow-diagram editor or a water pipe simulator. This agnostic model lives in the `shared` module, separated from the specific simulator logic.

## Core Vocabulary

The model is built on five primary nouns that define the ubiquitous language across the project:

- **`Circuit`**: The overarching container or workspace that holds the entire graph of nodes and connections.
- **`Component`**: A discrete node within the circuit (e.g., an AND Gate, a Resistor, a generic block).
- **`Port`**: A specific connection point on a Component. Ports are grouped (e.g., "inputs" or "outputs") and ordered by index.
- **`Wire`**: An edge that connects exactly two `Port` objects together.
- **`IC` (Integrated Circuit)**: A "macro" component that encapsulates an entire inner `Circuit` as a reusable, single node.

## Architecture Overview

The architecture of the Circuit API is cleanly separated into three main layers:

### 1. The Data Model (State & Schema)
Defines the raw JSON data structures, the authoritative mathematical graph of connectivity, and the atomic rules for mutating that state safely so that changes can be tracked for undo/redo operations.

### 2. The View Layer (Assembly)
The engine responsible for translating the abstract data nodes into a spatial layout. It maps the mathematical graph into physical dimensions, hit-boxes, and basic geometric visual primitives (like rectangles and circles).

### 3. The Public API (Wrappers)
The safe, object-oriented interface used by external consumers (like the UI and Simulators). It provides rich wrapper objects to interact with the raw model, manage transactions, and execute spatial queries without exposing the internal complexity.

## Directory Map

- **`schema/`**: Raw JSON data definitions for saving/loading circuits.
- **`internal/`**: The core engine, including state management (`impl`) and the visual rendering logic (`assembly`).
- **`public/`**: The safe, object-oriented API wrappers meant for external consumption.
- **`utils/`**: Generic mathematical and functional utilities used across the API.
