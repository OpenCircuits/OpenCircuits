import {GroupAction} from "core/actions/GroupAction";

import {Decoder} from "digital/models/ioobjects/other/Decoder";
import {Encoder} from "digital/models/ioobjects/other/Encoder";

import {SetInputPortCount}  from "../units/SetInputPortCount";
import {SetOutputPortCount} from "../units/SetOutputPortCount";


/**
 * This code changes the size of the Encoder/Decoder object based on how many inputs/ouputs are entered.
 * The number of inputs (decoder) or outputs (encoder) are increased by 2 to the power of the number
 * of inputs/outputs chosen.
 * Ex.) output count chosen  = 3, then the number of inputs changes to 2^3 or 8 for an encoder.
 * The actual size of the object is also changed accordingly.
 *
 * @param obj    The encoder/decoder to change.
 * @param target The target number of outputs/inputs.
 * @returns        An action that changes the objects ports.
 */
export function SetCoderPortCount(obj: Encoder | Decoder, target: number) {
    if (obj instanceof Encoder) {
        return new GroupAction([
            SetInputPortCount(obj, Math.pow(2, target)),
            SetOutputPortCount(obj, target),
        ]);
    }

    return new GroupAction([
        SetInputPortCount(obj, target),
        SetOutputPortCount(obj, Math.pow(2, target)),
    ]);
}
