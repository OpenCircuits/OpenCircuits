import {Margin} from "math/Rect";

import {Circuit, Obj} from "shared/api/circuit/public";

import {Cursor}       from "./input/Cursor";
import {DebugOptions} from "./impl/DebugOptions";
import {Viewport}     from "./Viewport";


// All state variables within the CircuitDesigner will/should NOT be serialized
// and shouldn't persist through user sessions. I.e. they will reset on page refresh
// and represent temporary state for the user in the current session.
export interface CircuitDesigner<CircuitT extends Circuit = Circuit> {
    readonly circuit: CircuitT;

    cursor?: Cursor;
    curPressedObj?: Obj;

    // A margin relative to the current viewport (Camera) used
    // for calculating the current "usable" viewport specifically
    // for fitting the camera. I.e. when the ItemNav is open, this margin
    // cuts off part of the canvas that is actually usable. (Issue #656)
    // TODO[master](leon) - See if maybe we can replace this with tracking if the ItemNav is open
    margin: Margin;

    debugOptions: DebugOptions;

    viewport: Viewport;
}
