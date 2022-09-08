import {GroupAction} from "core/actions/GroupAction";



import {SetInputPortCount}  from "digital/actions/units/SetInputPortCount";
import {SetOutputPortCount} from "digital/actions/units/SetOutputPortCount";
import {SetSelectPortCount} from "digital/actions/units/SetSelectPortCount";

import {Multiplexer} from "digital/models/ioobjects";

import {Mux} from "digital/models/ioobjects/other/Mux";


/**
 * This code changes the size of the Mux object based on how many inputs are entered.
 * When the selector inputs are increased the number of inputs are also increased by
 * 2 to the power of the number of selector inputs chosen.
 * Ex.) input count = 3, then the number of inputs changes to 2^3 or 8.
 * The actual size of the mux object is also changed accordingly.
 *
 * @param obj    Refers to the Mux object.
 * @param target Refers to the new number of inputs requested.
 * @returns        A port change action for mux's.
 */
export function SetMuxPortCount(obj: Mux, target: number) {
    return new GroupAction([
        SetSelectPortCount(obj, target),
        (obj instanceof Multiplexer
            ?  SetInputPortCount(obj, Math.pow(2, target))
            : SetOutputPortCount(obj, Math.pow(2, target))),
    ]);
}
