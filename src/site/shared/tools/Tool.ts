/* eslint-disable @typescript-eslint/no-namespace */
import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";


export namespace Tool {
    export enum State {
        Inactive,
        Active,
        Pending,
    }
}

export interface Tool {
    readonly kind: string;

    state: Tool.State;

    // This method is only called when the tool is active or when the default tool is active
    onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): Tool.State;
}
