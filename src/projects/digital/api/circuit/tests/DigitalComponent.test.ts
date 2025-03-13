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

    describe(".inputs and .outputs", () => {
        test("Basic", () => {
            const [circuit] = CreateCircuit();
            const andGate = circuit.placeComponentAt("ANDGate", V(0, 0));
            expect(andGate.inputs).toContainObjsExact(andGate.ports["inputs"]);
            expect(andGate.outputs).toContainObjsExact(andGate.ports["outputs"]);
        });

        test(".inputs on component with no inputs", () => {
            const [circuit] = CreateCircuit();
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            expect(sw.inputs).toBeDefined();
            expect(sw.inputs).toHaveLength(0);
        });
        test(".outputs on component with no outputs", () => {
            const [circuit] = CreateCircuit();
            const led = circuit.placeComponentAt("LED", V(0, 0));
            expect(led.outputs).toBeDefined();
            expect(led.outputs).toHaveLength(0);
        });
    });
});
