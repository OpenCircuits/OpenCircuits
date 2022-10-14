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

export type DigitalComponent =
    | DigitalNode
    | Switch
    | LED
    | ANDGate;

export type DigitalObj = DigitalPort | DigitalWire | DigitalComponent;
