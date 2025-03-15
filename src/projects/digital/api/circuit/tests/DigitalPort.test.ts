import "shared/tests/helpers/Extensions";

import {V}             from "Vector";
import {CreateCircuit} from "digital/api/circuit/public";


describe("DigitalPort", () => {
    test("Connected Ports", () => {
        // Create and place new component
        const [circuit, _] = CreateCircuit();

        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        a1.ports["outputs"][0].connectTo(a2.ports["inputs"][0]);

        expect(a1.ports["inputs"][0].connectedPorts).toHaveLength(0);
        expect(a1.ports["inputs"][1].connectedPorts).toHaveLength(0);
        expect(a1.ports["outputs"][0].connectedPorts).toHaveLength(1);

        expect(a2.ports["inputs"][0].connectedPorts).toHaveLength(1);
        expect(a2.ports["inputs"][1].connectedPorts).toHaveLength(0);
        expect(a2.ports["outputs"][0].connectedPorts).toHaveLength(0);

        expect(a1.ports["outputs"][0].connectedPorts[0].id).toEqual(a2.ports["inputs"][0].id);
        expect(a2.ports["inputs"][0].connectedPorts[0].id).toEqual(a1.ports["outputs"][0].id);
    });

    describe("Connections", () => {
        test("Use input port twice should Error", () => {
            const [circuit, _] = CreateCircuit();

            const i1 = circuit.placeComponentAt("Switch", V(0,  5));
            const i2 = circuit.placeComponentAt("Switch", V(0, -5));
            const o1 = circuit.placeComponentAt("LED",    V(5,  0));

            i1.outputs[0].connectTo(o1.inputs[0]);
            expect(i1.outputs[0].connections).toHaveLength(1);
            expect(o1.inputs[0].connections).toHaveLength(1);

            expect(() => i2.outputs[0].connectTo(o1.inputs[0])).toThrow();
            expect(() => o1.inputs[0].connectTo(i2.outputs[0])).toThrow();

            expect(i1.outputs[0].connections).toHaveLength(1);
            expect(o1.inputs[0].connections).toHaveLength(1);
        });
        test("Output port -> Output port should Error", () => {
            const [circuit, _] = CreateCircuit();

            const i1 = circuit.placeComponentAt("Switch", V(0,  5));
            const i2 = circuit.placeComponentAt("Switch", V(0, -5));

            expect(() => i2.outputs[0].connectTo(i2.outputs[0])).toThrow();

            expect(i1.outputs[0].connections).toHaveLength(0);
            expect(i2.outputs[0].connections).toHaveLength(0);
        });
        test("Input port -> Input port should Error", () => {
            const [circuit, _] = CreateCircuit();

            const o1 = circuit.placeComponentAt("LED", V(0,  5));
            const o2 = circuit.placeComponentAt("LED", V(0, -5));

            expect(() => o1.inputs[0].connectTo(o2.inputs[0])).toThrow();

            expect(o1.inputs[0].connections).toHaveLength(0);
            expect(o2.inputs[0].connections).toHaveLength(0);
        });
    });

    test("isAvailable", () => {
        const [circuit] = CreateCircuit();
        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        a1.ports["outputs"][0].connectTo(a2.ports["inputs"][0]);

        expect(a1.ports["outputs"][0].isAvailable).toBeTruthy();
        expect(a1.ports["inputs"][0].isAvailable).toBeTruthy();
        expect(a1.ports["inputs"][1].isAvailable).toBeTruthy();

        expect(a2.ports["outputs"][0].isAvailable).toBeTruthy();
        expect(a2.ports["inputs"][0].isAvailable).toBeFalsy();
        expect(a2.ports["inputs"][1].isAvailable).toBeTruthy();
    });

    test("canConnectTo", () => {
        const [circuit] = CreateCircuit();
        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        a1.outputs[0].connectTo(a2.inputs[0]);

        expect(a1.outputs[0].canConnectTo(a1.outputs[0])).toBeFalsy();
        expect(a1.outputs[0].canConnectTo(a1.inputs[0])).toBeTruthy();
        expect(a1.outputs[0].canConnectTo(a1.inputs[1])).toBeTruthy();
        expect(a1.outputs[0].canConnectTo(a2.outputs[0])).toBeFalsy();
        expect(a1.outputs[0].canConnectTo(a2.inputs[0])).toBeFalsy();
        expect(a1.outputs[0].canConnectTo(a2.inputs[1])).toBeTruthy();

        expect(a1.inputs[0].canConnectTo(a1.outputs[0])).toBeTruthy();
        expect(a1.inputs[0].canConnectTo(a1.inputs[0])).toBeFalsy();
        expect(a1.inputs[0].canConnectTo(a1.inputs[1])).toBeFalsy();
        expect(a1.inputs[0].canConnectTo(a2.outputs[0])).toBeTruthy();
        expect(a1.inputs[0].canConnectTo(a2.inputs[0])).toBeFalsy();
        expect(a1.inputs[0].canConnectTo(a2.inputs[1])).toBeFalsy();

        expect(a2.inputs[0].canConnectTo(a1.outputs[0])).toBeFalsy();
        expect(a2.inputs[0].canConnectTo(a1.inputs[0])).toBeFalsy();
        expect(a2.inputs[0].canConnectTo(a1.inputs[1])).toBeFalsy();
        expect(a2.inputs[0].canConnectTo(a2.outputs[0])).toBeFalsy();
        expect(a2.inputs[0].canConnectTo(a2.inputs[0])).toBeFalsy();
        expect(a2.inputs[0].canConnectTo(a2.inputs[1])).toBeFalsy();
    });
});
