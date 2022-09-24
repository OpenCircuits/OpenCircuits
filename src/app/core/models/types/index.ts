import {AnalogObj, AnalogPort, AnalogWire}                                   from "./analog";
import {DigitalComponent, DigitalNode, DigitalObj, DigitalPort, DigitalWire} from "./digital";


export type AnyComponent =
    | DigitalComponent;

export type AnyPort =
    | DigitalPort
    | AnalogPort;

export type AnyWire =
    | DigitalWire
    | AnalogWire;

export type AnyNode =
    | DigitalNode;

export type AnyObj =
    | DigitalObj
    | AnalogObj;
