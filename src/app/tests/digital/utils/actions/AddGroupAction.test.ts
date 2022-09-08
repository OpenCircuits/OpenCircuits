import {AddGroup} from "core/actions/compositions/AddGroup";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalObjectSet}       from "digital/models/DigitalObjectSet";
import {DigitalWire}            from "digital/models/DigitalWire";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {LED} from "digital/models/ioobjects/outputs/LED";


describe("Add Group Action", () => {
    test("Use the same Wire reference", () => {
        const designer = new DigitalCircuitDesigner(0);
        const input = new Switch();
        const output = new LED();

        const outPort = input.getOutputPort(0);
        const inPort = output.getInputPort(0);
        const wire = new DigitalWire(outPort, inPort);
        outPort.connect(wire);
        inPort.connect(wire);

        const circuit = DigitalObjectSet.From([input, output, wire]);
        AddGroup(designer, circuit);

        expect(circuit.getWires()).toHaveLength(1);
        expect(outPort.getWires()).toHaveLength(1);
        expect(inPort.getWires()).toHaveLength(1);
        expect(circuit.getWires()[0]).toBe(wire);
        expect(outPort.getWires()[0]).toBe(wire);
        expect(inPort.getWires()[0]).toBe(wire);
    });
});
