import {Component, ComponentFactory, DefaultComponent} from "./base/Component";
import {DefaultPort, Port, PortFactory}                from "./base/Port";
import {DefaultWire, Wire, WireFactory}                from "./base/Wire";


export enum AnalogPortGroup {
    Input  = 0,
    Output = 1,
    Select = 2,
}

export type AnalogPort = Port & { kind: "AnalogPort",group: AnalogPortGroup }
export type AnalogWire = Wire & { kind: "AnalogWire" }

export type AnalogNode = Component & { kind: "AnalogNode" };

export type Ground = Component & { kind: "Ground" };

export type Resistor = Component & { kind: "Resistor", resistance: number };

export type Oscilloscope = Component & { kind: "Oscilloscope", height: number, width: number, inputs:number, delay: number, samples: number };


export type AnalogComponent =
    | AnalogNode
    | Ground
    | Oscilloscope
    | Resistor;

export type AnalogObj = AnalogPort | AnalogWire | AnalogComponent;


export const DefaultAnalogComponent: { [C in AnalogComponent as C["kind"]]: ComponentFactory<C> } = {
    "AnalogNode": (id) => ({ ...DefaultComponent(id), kind: "AnalogNode"                 }),
    "Ground":     (id) => ({ ...DefaultComponent(id), kind: "Ground"                     }),
    "Resistor":   (id) => ({ ...DefaultComponent(id), kind: "Resistor", resistance: 1000 }),
    "Oscilloscope": (id) => ({ ...DefaultComponent(id), kind: "Oscilloscope", height: 8, width: 4, inputs: 1 , delay: 100, samples: 100 }),
};

export const DefaultAnalogPort: PortFactory<AnalogPort> =
    (id, parent, group, index) => ({ ...DefaultPort(id, parent, group, index), kind: "AnalogPort" });

export const DefaultAnalogWire: WireFactory<AnalogWire> =
    (id, p1, p2) => ({ ...DefaultWire(id, p1, p2), kind: "AnalogWire" });
