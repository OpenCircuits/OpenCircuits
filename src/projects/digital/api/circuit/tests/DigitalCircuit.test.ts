import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";
import {V} from "Vector";


describe("DigitalCircuit", () => {
    describe(".toSchema()", () => {
        test("Deleted off Switch should not be in simState", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [sw] = Place("Switch");

            sw.delete();
            const schema = circuit.toSchema();
            expect(Object.keys(schema.simState.signals)).toHaveLength(0);
            expect(Object.keys(schema.simState.states)).toHaveLength(0);
            expect(Object.keys(schema.simState.icStates)).toHaveLength(0);
        });
        test("Deleted on Switch should not be in simState", () => {
            const [circuit, _, { Place, TurnOn }] = CreateTestCircuit();
            const [sw] = Place("Switch");
            TurnOn(sw);

            sw.delete();
            const schema = circuit.toSchema();
            expect(Object.keys(schema.simState.signals)).toHaveLength(0);
            expect(Object.keys(schema.simState.states)).toHaveLength(0);
            expect(Object.keys(schema.simState.icStates)).toHaveLength(0);
        });
        test("Deleted IC should not be in simState", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [icCircuit, {}, { PlaceAndConnect: ICPlaceAndConnect }] = CreateTestCircuit();
            const ic = (() => {
                const [sw, { outputs: [led] }] = ICPlaceAndConnect("Switch");
                icCircuit.name = "To be deleted IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: sw.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: led.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,   0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();
            const [icInstance] = Place(ic.id);
            icInstance.delete();
            const schema = circuit.toSchema();
            expect(Object.keys(schema.simState.signals)).toHaveLength(0);
            expect(Object.keys(schema.simState.states)).toHaveLength(0);
            expect(Object.keys(schema.simState.icStates)).toHaveLength(0);
        });
        test("Convert IC to schema and load back in", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [icCircuit, {}, { PlaceAndConnect: ICPlaceAndConnect }] = CreateTestCircuit();
            const ic = (() => {
                const [gate, { inputs: [sw1, sw2], outputs: [out] }] = ICPlaceAndConnect("ANDGate");
                icCircuit.name = "To be serialized IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: sw1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, +0.5), dir: V(-1, 0) },
                            { id: sw2.outputs[0].id, group: "inputs", name: "In 2", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: out.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();
            Place(ic.id);
            const schema = circuit.toSchema();

            const [newCircuit, _state, { Place: PlaceNew, Connect: ConnectNew, TurnOn: TurnOnNew }] = CreateTestCircuit();
            newCircuit.loadSchema(schema);
            const newComps = newCircuit.getComponents();
            expect(newComps).toHaveLength(1);
            const icInstance = newComps[0];

            const [sw1, sw2, led] = PlaceNew("Switch", "Switch", "LED");
            ConnectNew(sw1, icInstance.inputs[0]);
            ConnectNew(sw2, icInstance.inputs[1]);
            ConnectNew(icInstance, led);
            expect(led).toBeOff();
            TurnOnNew(sw1);
            TurnOnNew(sw2);
            expect(led).toBeOn();
        });
    });
});
