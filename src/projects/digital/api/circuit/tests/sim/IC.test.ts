import {Signal} from "digital/api/circuit/internal/sim/Signal";
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

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
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

                return circuit.createIC({
                    circuit: innerICCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
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

                return circuit.createIC({
                    circuit: outerICCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
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

    describe("IC with Switch keeps state", () => {
        test("Basic", () => {
            const [circuit, {}, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, i2, g, o1] = ICPlace("Switch", "InputPin", "ANDGate", "OutputPin");
                ICConnect(i1, g.inputs[0]), ICConnect(i2, g.inputs[1]), ICConnect(g, o1);

                i1.setSimState([Signal.On]);

                icCircuit.name = "AND Gate IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { inputs: [sw1], outputs: [out] }] = PlaceAndConnect(ic.id);

            // Basic
            expect(out).toBeOff();
            TurnOn(sw1);
            expect(out).toBeOn();

            // Turning off
            TurnOff(sw1);
            expect(out).toBeOff();
        });
    });

    describe("IC with constant inputs", () => {
        test("Constant Low", () => {
            const [circuit, {}, { PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, o1] = ICPlace("ConstantLow", "OutputPin");
                ICConnect(i1, o1);

                icCircuit.name = "Constant Low IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { outputs: [out] }] = PlaceAndConnect(ic.id);

            expect(out).toBeOff();
        });
        test("Constant High", () => {
            const [circuit, {}, { PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, o1] = ICPlace("ConstantHigh", "OutputPin");
                ICConnect(i1, o1);

                icCircuit.name = "Constant High IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { outputs: [out] }] = PlaceAndConnect(ic.id);

            expect(out).toBeOn();
        });
        test("Constant Number (0)", () => {
            const [circuit, {}, { PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, o1, o2, o3, o4] = ICPlace("ConstantNumber", "OutputPin", "OutputPin", "OutputPin", "OutputPin");
                ICConnect(i1.outputs[0], o1), ICConnect(i1.outputs[1], o2), ICConnect(i1.outputs[2], o3), ICConnect(i1.outputs[3], o4);

                icCircuit.name = "Constant Number IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect(ic.id);

            expect(out1).toBeOff();
            expect(out2).toBeOff();
            expect(out3).toBeOff();
            expect(out4).toBeOff();
        });
        test("Constant Number (F)", () => {
            const [circuit, {}, { PlaceAndConnect }] = CreateTestCircuit();

            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                // const [_, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                const [i1, o1, o2, o3, o4] = ICPlace("ConstantNumber", "OutputPin", "OutputPin", "OutputPin", "OutputPin");
                ICConnect(i1.outputs[0], o1), ICConnect(i1.outputs[1], o2), ICConnect(i1.outputs[2], o3), ICConnect(i1.outputs[3], o4);

                i1.setProp("inputNum", 15);
                icCircuit.name = "Constant Number IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out", pos: V(+1, 0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();

            const [_, { outputs: [out1, out2, out3, out4] }] = PlaceAndConnect(ic.id);

            expect(out1).toBeOn();
            expect(out2).toBeOn();
            expect(out3).toBeOn();
            expect(out4).toBeOn();
        });
    });
});
