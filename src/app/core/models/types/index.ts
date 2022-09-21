import {AnalogObj}                    from "./analog";
import {DigitalComponent, DigitalObj} from "./digital";


export type AnyComponent =
    | DigitalComponent;

export type AnyObj =
    | DigitalObj
    | AnalogObj;
