import {AnalogComponent, AnalogNode, AnalogObj, AnalogPort, AnalogWire,
        DefaultAnalogComponent, DefaultAnalogPort, DefaultAnalogWire}        from "./analog";
import {PortFactory}                                                         from "./base/Port";
import {WireFactory}                                                         from "./base/Wire";
import {DefaultDigitalComponent, DefaultDigitalPort, DefaultDigitalWire,
        DigitalComponent, DigitalNode, DigitalObj, DigitalPort, DigitalWire} from "./digital";


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


export const DefaultComponent = {
    ...DefaultDigitalComponent,
    ...DefaultAnalogComponent,
};

export const DefaultPort: { [P in AnyPort as P["kind"]]: PortFactory<P> } = {
    "DigitalPort": DefaultDigitalPort,
    "AnalogPort":  DefaultAnalogPort,
};

export const DefaultWire: { [W in AnyWire as W["kind"]]: WireFactory<W> } = {
    "DigitalWire": DefaultDigitalWire,
    "AnalogWire":  DefaultAnalogWire,
};
