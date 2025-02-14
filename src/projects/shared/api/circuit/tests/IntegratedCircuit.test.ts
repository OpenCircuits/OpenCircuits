import {CreateCircuit} from "digital/public";

import "./Extensions";
import {V} from "Vector";


describe("IntegratedCircuit", () => {
    test("Basic IC", () => {
        const [circuit, _] = CreateCircuit();

        const ic = circuit.createIC();

        const i1 = ic.placeComponentAt("InputPin",  V(-5, -5));
        const i2 = ic.placeComponentAt("InputPin",  V(-5, +5));
        const o1 = ic.placeComponentAt("OutputPin", V(+5,  0));
        const g  = ic.placeComponentAt("ANDGate", V(0, 0));

        i1.allPorts[0].connectTo(g.ports["inputs"][0]);
        i2.allPorts[0].connectTo(g.ports["inputs"][1]);
        g.ports["outputs"][0].connectTo(o1.allPorts[0]);

        ic.name = "My IC";
        ic.display.size = V(4, 2);
        i1.name = "In 1";
        ic.display.setPinPos(i1.id, V(-3, 1));
        i2.name = "In 2";
        ic.display.setPinPos(i2.id, V(-3, -1));
        o1.name = "Out";
        ic.display.setPinPos(o1.id, V(3, 0));

        expect(ic.display.size).toBe(V(4, 2));
    });
});
