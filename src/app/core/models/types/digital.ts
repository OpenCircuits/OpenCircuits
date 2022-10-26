import {Component, ComponentFactory, DefaultComponent} from "./base/Component";
import {DefaultPort, Port, PortFactory}                from "./base/Port";
import {DefaultWire, Wire, WireFactory}                from "./base/Wire";


export enum DigitalPortGroup {
    Input = 0,
    Output = 1,
    Select = 2,
}

export type DigitalPort = Port      & { kind: "DigitalPort", group: DigitalPortGroup };
export type DigitalWire = Wire      & { kind: "DigitalWire" };
export type DigitalNode = Component & { kind: "DigitalNode" };

// components
export type ANDGate = Component & { kind: "ANDGate" };
export type Switch  = Component & { kind: "Switch" };
export type LED     = Component & { kind: "LED", color: string };

export type DFlipFlop  = Component & { kind: "DFlipFlop" };
export type TFlipFlop  = Component & { kind: "TFlipFlop" };
export type JKFlipFlop = Component & { kind: "JKFlipFlop" };
export type SRFlipFlop = Component & { kind: "SRFlipFlop" };

export type FlipFlop = DFlipFlop|TFlipFlop|JKFlipFlop|SRFlipFlop;

export type DigitalComponent =
    | DigitalNode
    | ANDGate
    | Switch
    | LED
    | FlipFlop

export type DigitalObj = DigitalPort | DigitalWire | DigitalComponent;


/** Defines all components. */
export const DefaultDigitalComponent: { [C in DigitalComponent as C["kind"]]: ComponentFactory<C> } = {
    "DigitalNode": (id) => ({ ...DefaultComponent(id), kind: "DigitalNode" }),
    "Switch":      (id) => ({ ...DefaultComponent(id), kind: "Switch" }),
    "LED":         (id) => ({ ...DefaultComponent(id), kind: "LED", color: "#ffffff" }),
    "ANDGate":     (id) => ({ ...DefaultComponent(id), kind: "ANDGate" }),
    "DFlipFlop":   (id) => ({ ...DefaultComponent(id), kind: "DFlipFlop" }),
    "TFlipFlop":   (id) => ({ ...DefaultComponent(id), kind: "TFlipFlop" }),
    "JKFlipFlop":  (id) => ({ ...DefaultComponent(id), kind: "JKFlipFlop" }),
    "SRFlipFlop":  (id) => ({ ...DefaultComponent(id), kind: "SRFlipFlop" }),
};

export const DefaultDigitalPort: PortFactory<DigitalPort> =
    (id, parent, group, index) => ({ ...DefaultPort(id, parent, group, index), kind: "DigitalPort" });

export const DefaultDigitalWire: WireFactory<DigitalWire> =
    (id, p1, p2) => ({ ...DefaultWire(id, p1, p2), kind: "DigitalWire" });
