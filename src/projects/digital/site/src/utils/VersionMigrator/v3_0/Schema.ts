export interface Vector {
    x: number;
    y: number;
}
export interface Transform {
    pos: Vector;
    size: Vector;
    angle: number;
    scale: Vector;
}
export interface PortSet {
    parent: DigitalComponent;
    oldPorts: DigitalPort[];
    currentPorts: DigitalPort[];
    count: {
        value: number;
        minValue: number;
        maxValue: number;
    };
    positioner: unknown;
}
export interface IOObject extends Record<string, unknown> {
    name: {
        name: string;
        set: boolean;
    };
}
export interface DigitalPort {
    parent: DigitalComponent;
    isOn: boolean;
    name: string;
    dir: Vector;
    origin: Vector;
    target: Vector;
    connections: DigitalWire[];
}
export interface DigitalWire extends IOObject {
    p1: DigitalPort;
    p2: DigitalPort;
    shape: unknown;
    straight: boolean;
    isOn: boolean;
}
export interface DigitalComponent extends IOObject {
    designer: unknown;
    transform: Transform;
    inputs: PortSet;
    outputs: PortSet;
}
export interface DigitalObjectSet {
    components: DigitalComponent[];
    wires: DigitalWire[];

    inputs: DigitalComponent[];
    outputs: DigitalComponent[];
    others: DigitalComponent[];
}
export interface ICData {
    name: string;
    transform: Transform;
    collection: DigitalObjectSet;
    inputPorts: DigitalPort[];
    outputPorts: DigitalPort[];
}
export interface ContentsData {
    designer: {
        propagationTime: number;
        ics: ICData[];
        objects: DigitalComponent[];
        wires: DigitalWire[];
        propagationQueue: unknown;
        updateRequest: unknown;
    };
    camera: {
        width: number;
        height: number;
        pos: Vector;
        zoom: number;
    };
}
export interface Circuit {
    metadata: {
        id: string;
        name: string;
        owner: string;
        desc: string;
        thumbnail: string;
        version: string;
    };
    contents: string;
}
