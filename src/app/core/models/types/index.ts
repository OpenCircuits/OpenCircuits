import {AnalogComponent, AnalogNode, AnalogObj, AnalogPort, AnalogWire}      from "./analog";
import {DigitalComponent, DigitalNode, DigitalObj, DigitalPort, DigitalWire} from "./digital";


export type AnyComponent =
    | DigitalComponent
    | AnalogComponent;

export type AnyPort =
    | DigitalPort
    | AnalogPort;

export type AnyWire =
    | DigitalWire
    | AnalogWire;

export type AnyNode =
    | DigitalNode
    | AnalogNode;

export type AnyObj =
    | DigitalObj
    | AnalogObj;
