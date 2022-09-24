import {AnalogObj, AnalogPort, AnalogWire}                      from "./analog";
import {DigitalComponent, DigitalObj, DigitalPort, DigitalWire} from "./digital";


export type AnyComponent =
    | DigitalComponent;

export type AnyPort =
    | DigitalPort
    | AnalogPort;

export type AnyWire =
    | DigitalWire
    | AnalogWire;

export type AnyObj =
    | DigitalObj
    | AnalogObj;
