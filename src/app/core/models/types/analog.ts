import {Port} from "./base/Port";
import {Wire} from "./base/Wire";


export type AnalogPort = Port & { kind: "AnalogPort" }
export type AnalogWire = Wire & { kind: "AnalogWire" }

export type AnalogObj =
    | AnalogPort
    | AnalogWire;
