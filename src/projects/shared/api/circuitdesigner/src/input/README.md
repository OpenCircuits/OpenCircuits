# Input Adapters (`input`)

This directory contains the logic responsible for capturing raw browser interactions (like mouse clicks, keyboard presses, and touch gestures) and normalizing them into a unified stream of generic events.

## Architecture

By abstracting away raw DOM events, the `CircuitDesigner` is able to handle complex interactions (like a user pinching to zoom on a mobile device, or holding 'Shift' while dragging a mouse) through a single, consistent interface. The `ToolManager` listens to these normalized events and routes them to the appropriate active `Tool`.

## Files

- **`InputAdapter.ts`**: The core event listener. It attaches to the HTML Canvas and the `window` to intercept all native `MouseEvent`s, `KeyboardEvent`s, and `TouchEvent`s (using Hammer.js for gestures). It tracks ongoing state (like which keys are currently held down) and fires standardized `InputAdapterEvent`s.
- **`InputAdapterEvent.ts`**: Defines the strongly-typed union of possible input events (`MouseInputEvent`, `KeyboardInputEvent`, `ZoomInputEvent`, etc.) emitted by the adapter.
- **`UserInputState.ts`**: Defines an interface representing the instantaneous state of the user's input devices (e.g., current mouse position, delta since last frame, a `Set` of currently depressed keys).
- **`Key.ts`**: A string literal union type enforcing valid keyboard keys, preventing arbitrary string errors.
- **`Cursor.ts`**: Enumerates standard CSS cursor styles used to change the mouse pointer (e.g., to a grabbing hand) during interactions.
- **`Constants.ts`**: Constants for things like the minimum hold duration (`DRAG_TIME`) required for a click to become a drag.
