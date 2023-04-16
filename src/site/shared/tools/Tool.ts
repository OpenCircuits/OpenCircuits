/* eslint-disable @typescript-eslint/no-namespace */
import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";


export namespace Tool {
    export type BaseState = "Inactive" | "Active";
}

// eslint-disable-next-line @typescript-eslint/ban-types
type DefaultState = Tool.BaseState | (string & {});

export interface Tool<S extends DefaultState = DefaultState> {
    readonly kind: string;

    state: S;

    // This method is only called when the tool is active or when the default tool is active
    onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): void;
}
