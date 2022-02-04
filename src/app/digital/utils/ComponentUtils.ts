import {Create, GetIDFor} from "serialeazy";

import {BCDtoDecimal} from "math/MathUtils";

import {IOObject} from "core/models";

import {DigitalCircuitDesigner, DigitalComponent, DigitalWire} from "digital/models";
import {InputPort, OutputPort} from "digital/models/ports";
import {Gate} from "digital/models/ioobjects/gates/Gate";
import {IC, ICData} from "digital/models/ioobjects";


/**
 * Stores identifier of types of gates corresponded to their inverted counterparts
 */
const gateInversion: Record<string, string> = {
    "ANDGate": "NANDGate",
    "NANDGate": "ANDGate",
    "ORGate": "NORGate",
    "NORGate": "ORGate",
    "XORGate": "XNORGate",
    "XNORGate": "XORGate",
    "BUFGate": "NOTGate",
    "NOTGate": "BUFGate",
}

/**
 * Gets a new instance of the inverted version of the supplied gate
 *
 * @param oldGate the gate to get the inverted version of
 * @returns NANDGate when supplied with an ANDGate, NORGate when supplied with an ORGate, etc.
 * @throws {Error} when the ID for oldGate cannot be found
 */
export function GetInvertedGate(oldGate: Gate): Gate {
    const oldName = GetIDFor(oldGate);
    if (!oldName || !(oldName in gateInversion))
        throw new Error(`Failed to find gate to invert with ID: ${oldName}!`);
    const newName = gateInversion[oldName];
    return Create<Gate>(newName);
}

export function PortsToDecimal(ports: (InputPort | OutputPort)[]): number {
    return BCDtoDecimal(ports.map(p => p.getIsOn()));
}

/**
 * Connects two components together. Source must have an output and destination must have an available input.
 * The first available port of destination will be used as the input port
 *
 * @param source the source component to connect
 * @param destination the destination component to connect
 * @returns the wire used to connect the components together
 * @throws {Error} if there is no available InputPort on destination
 */
export function LazyConnect(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    const outPort = source.getOutputPort(0);
    const inPort = destination.getInputPorts().find(port => port.getWires().length === 0);

    if (!inPort)
        throw new Error("No available InputPort on destination");

    const wire = new DigitalWire(outPort, inPort);
    inPort.connect(wire);
    outPort.connect(wire);
    return wire;
}


/**
 * Check if the given ICData is currently being used by an IC within the given DigitalCircuitDesigner
 *
 * @param designer the designer to check for usage in
 * @param data the ICData to check for usage for
 * @returns true if the ICData is being used somewhere, false otherwise
 */
export function IsICDataInUse(designer: DigitalCircuitDesigner, data: ICData): boolean {
    const checkInUse = (objs: IOObject[]): boolean => {
        return objs.some(o =>
            (o instanceof IC &&
                (o.getData() === data ||
                 // Recursively check if this IC depends on the given data
                 checkInUse(o.getData().getGroup().toList())))
        );
    };
    return checkInUse(designer.getAll());
}
