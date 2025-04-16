import {DigitalComponent} from "./DigitalComponent";
import {DigitalWire} from "./DigitalWire";
import {DigitalPort} from "./DigitalPort";


export const isComponent =
    (obj: DigitalComponent | DigitalWire | DigitalPort): obj is DigitalComponent => (obj.baseKind === "Component");

export const isWire =
    (obj: DigitalComponent | DigitalWire | DigitalPort): obj is DigitalWire => (obj.baseKind === "Wire");

export const isPort =
    (obj: DigitalComponent | DigitalWire | DigitalPort): obj is DigitalPort => (obj.baseKind === "Port");

export const isInputPort =
    (obj: DigitalComponent | DigitalWire | DigitalPort): obj is DigitalPort =>
        (obj.baseKind === "Port") && obj.isInputPort;

export const isOutputPort =
    (obj: DigitalComponent | DigitalWire | DigitalPort): obj is DigitalPort =>
        (obj.baseKind === "Port") && obj.isOutputPort;
