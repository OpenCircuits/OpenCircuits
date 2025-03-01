import "shared/tests/helpers/Extensions";

import {V}             from "Vector";
import {CreateCircuit} from "digital/api/circuit/public";


describe("Port", () => {
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

    test("isAvailable", () => {
        const [circuit] = CreateCircuit();
        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        a1.ports["outputs"][0].connectTo(a2.ports["inputs"][0]);

        expect(a1.ports["outputs"][0].isAvailable()).toBeTruthy();
        expect(a1.ports["inputs"][0].isAvailable()).toBeTruthy();
        expect(a1.ports["inputs"][1].isAvailable()).toBeTruthy();
        expect(a2.ports["outputs"][0].isAvailable()).toBeTruthy();
        expect(a2.ports["inputs"][0].isAvailable()).toBeFalsy();
        expect(a2.ports["inputs"][1].isAvailable()).toBeTruthy();
    });

    test("getLegalWires isWireable", () => {
        const [circuit] = CreateCircuit();
        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        a1.ports["outputs"][0].connectTo(a2.ports["inputs"][0]);

        expect(a1.ports["outputs"][0].getLegalWires().isWireable).toBeTruthy();
        expect(a1.ports["inputs"][0].getLegalWires().isWireable).toBeTruthy();
        expect(a1.ports["inputs"][1].getLegalWires().isWireable).toBeTruthy();
        expect(a2.ports["outputs"][0].getLegalWires().isWireable).toBeTruthy();
        expect(a2.ports["inputs"][0].getLegalWires().isWireable).toBeFalsy();
        expect(a2.ports["inputs"][1].getLegalWires().isWireable).toBeTruthy();
    });

    test("getLegalWires contains", () => {
        const [circuit] = CreateCircuit();
        const a1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const a2 = circuit.placeComponentAt("ANDGate", V(10, 10));

        const [a1o1] = a1.ports["outputs"];
        const [a1i1, a1i2] = a1.ports["inputs"];
        const [a2o1] = a2.ports["outputs"];
        const [a2i1, a2i2] = a2.ports["inputs"];

        a1o1.connectTo(a2i1);

        expect(a1o1.getLegalWires().contains(a1o1)).toBeFalsy();
        expect(a1o1.getLegalWires().contains(a1i1)).toBeTruthy();
        expect(a1o1.getLegalWires().contains(a1i2)).toBeTruthy();
        expect(a1o1.getLegalWires().contains(a2o1)).toBeFalsy();
        expect(a1o1.getLegalWires().contains(a2i1)).toBeTruthy();
        expect(a1o1.getLegalWires().contains(a2i2)).toBeTruthy();

        expect(a1i1.getLegalWires().contains(a1o1)).toBeTruthy();
        expect(a1i1.getLegalWires().contains(a1i1)).toBeFalsy();
        expect(a1i1.getLegalWires().contains(a1i2)).toBeFalsy();
        expect(a1i1.getLegalWires().contains(a2o1)).toBeTruthy();
        expect(a1i1.getLegalWires().contains(a2i1)).toBeFalsy();
        expect(a1i1.getLegalWires().contains(a2i2)).toBeFalsy();

        expect(a2i1.getLegalWires().contains(a1o1)).toBeFalsy();
        expect(a2i1.getLegalWires().contains(a1i1)).toBeFalsy();
        expect(a2i1.getLegalWires().contains(a1i2)).toBeFalsy();
        expect(a2i1.getLegalWires().contains(a2o1)).toBeFalsy();
        expect(a2i1.getLegalWires().contains(a2i1)).toBeFalsy();
        expect(a2i1.getLegalWires().contains(a2i2)).toBeFalsy();
    });
});
