import {V}             from "Vector";
import {CreateCircuit} from "digital/public";

import "./Extensions";


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
});
