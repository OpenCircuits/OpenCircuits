import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {V} from "Vector";


describe("IC", () => {
    describe("Basic ANDGate IC", () => {
        test("Basic", () => {
            const [circuit, {}, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, i2, g, o1] = ICPlace("InputPin", "InputPin", "ANDGate", "OutputPin");
                ICConnect(i1, g.inputs[0]), ICConnect(i2, g.inputs[1]), ICConnect(g, o1);

                icCircuit.name = "AND Gate IC";
                i1.outputs[0].name = "In 1";
                i2.outputs[0].name = "In 2";
                o1.inputs[0].name = "Out";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect(ic.id);

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOff();
        });
    });

    describe("Basic Nested ANDGate IC", () => {
        test("Basic", () => {
            const [circuit, {}, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();

            const [innerICCircuit, {}, { Place: InnerICPlace, Connect: InnerICConnect }] = CreateTestCircuit();
            const innerIC = (() => {
                const [i1, i2, g, o1] = InnerICPlace("InputPin", "InputPin", "ANDGate", "OutputPin");
                InnerICConnect(i1, g.inputs[0]), InnerICConnect(i2, g.inputs[1]), InnerICConnect(g, o1);

                innerICCircuit.name = "AND Gate IC";
                i1.outputs[0].name = "In 1";
                i2.outputs[0].name = "In 2";
                o1.inputs[0].name = "Out";

                return circuit.createIC({
                    circuit: innerICCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [outerICCircuit, {}, { Place: OuterICPlace, Connect: OuterICConnect }] = CreateTestCircuit();
            outerICCircuit.importICs([innerIC]);
            const outerIC = (() => {
                const [i1, i2, g, o1] = OuterICPlace("InputPin", "InputPin", innerIC.id, "OutputPin");
                OuterICConnect(i1, g.inputs[0]), OuterICConnect(i2, g.inputs[1]), OuterICConnect(g, o1);

                outerICCircuit.name = "AND Gate IC 2";
                i1.outputs[0].name = "In 1";
                i2.outputs[0].name = "In 2";
                o1.inputs[0].name = "Out";

                return circuit.createIC({
                    circuit: outerICCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { inputs: [sw1, sw2], outputs: [out] }] = PlaceAndConnect(outerIC.id);

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOff();
            TurnOn(sw2);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
            TurnOff(sw2);
            expect(out).toBeOff();
        });
    });
});
