import {Component} from "./base/Component";
import {Port}      from "./base/Port";
import {Wire}      from "./base/Wire";


export enum DigitalPortGroup {
    Input  = 0,
    Output = 1,
    Select = 2,
}

export type DigitalPort = Port      & { kind: "DigitalPort", group: DigitalPortGroup };
export type DigitalWire = Wire      & { kind: "DigitalWire" };
export type DigitalNode = Component & { kind: "DigitalNode" };

export type ANDGate = Component & { kind: "ANDGate" };
export type Switch  = Component & { kind: "Switch"  };
export type LED     = Component & { kind: "LED", color: string };
export type DFlipFlop = Component & { kind: "DFlipFlop" }
export type JKFlipFlop = Component & { kind: "JKFlipFlop" }
export type SRFlipFlop = Component & { kind: "SRFlipFlop" }
export type TFlipFlop = Component & { kind: "TFlipFlop" }

export type DigitalComponent =
    | DigitalNode
    | Switch
    | LED
    | ANDGate
    | DFlipFlop
    | JKFlipFlop
    | SRFlipFlop
    | TFlipFlop;

export type DigitalObj = DigitalPort | DigitalWire | DigitalComponent;
