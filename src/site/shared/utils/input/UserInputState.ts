import {Vector} from "Vector";
import {Key}    from "./Key";


/**
 * This interface represents the current state of user-input-related data.
 *
 * This includes direct user-input-state, i.e. which mouse buttons and keys are currently being pressed, along with
 *  persistent user-input data like the previous mouse position and when they began pressing.
 */
export interface UserInputState {
    /** A vector representing the position the mouse was when the mousebutton first became pressed. */
    readonly mouseDownPos: Vector;
    /** A vector representing the previous position of the mouse. */
    readonly prevMousePos: Vector;
    /** A vector representing the current position of the mouse. */
    readonly mousePos: Vector;
    /** A vector representing the change in mouse position. */
    readonly deltaMousePos: Vector;

    readonly worldMousePos: Vector;

    /** True if a mousebutton is held down, false otherwise. */
    readonly isMouseDown: boolean;
    /** Represents the mousebutton being pressed (left, middle, right, etc.). */
    readonly mouseDownButton: number;

    /** True if the mouse is being dragged, false otherwise. (a "drag" being distinct from a "click"). */
    readonly isDragging: boolean;
    /** Represents the time at which the mouse button became held down. */
    readonly startTapTime: number;

    /** Represents the number of touches currently active (i.e. fingers on a touchpad or mobile device). */
    readonly touchCount: number;

    /** Set of keys that currently pressed. */
    readonly keysDown: ReadonlySet<Key>;

    /** True if the shift key is down. */
    readonly isShiftKeyDown: boolean;
    /** True if the escape key is down. */
    readonly isEscKeyDown: boolean;
    /** True if the modifier key (control/command/meta) is down. */
    readonly isModifierKeyDown: boolean;
    /** True if the alt key is down. */
    readonly isAltKeyDown: boolean;
}
