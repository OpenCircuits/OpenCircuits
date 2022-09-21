import {AnalogObj, AnalogPort}                     from "./analog";
import {DigitalComponent, DigitalObj, DigitalPort} from "./digital";


export type AnyComponent =
    | DigitalComponent;

export type AnyPort =
    | DigitalPort
    | AnalogPort;

export type AnyObj =
    | DigitalObj
    | AnalogObj;
