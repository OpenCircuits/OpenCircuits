/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/tests/helpers/Extensions";

import {V} from "Vector";
import {Rect} from "math/Rect";

import {Circuit, Obj} from "shared/api/circuit/public";
import {CreateCircuit} from "../src/public";


describe("DigitalComponent", () => {
    describe("Ports", () => {
        test(".ports", () => {
            const [circuit, state] = CreateCircuit();
            const andGate = circuit.placeComponentAt("ANDGate", V(0, 0));
            expect(andGate.ports["inputs"]).toHaveLength(2);
            expect(andGate.ports["outputs"]).toHaveLength(1);
            expect(andGate.allPorts).toHaveLength(3);
        });
    });
});
