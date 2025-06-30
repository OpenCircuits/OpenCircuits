import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";
import {V} from "Vector";


describe("DigitalCircuit", () => {
    describe("Simulation State", () => {
        test("Deleted off Switch should not be in simState", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [sw] = Place("Switch");

            sw.delete();
            const simState = circuit.sim.state;
            expect(Object.keys(simState.signals)).toHaveLength(0);
            expect(Object.keys(simState.states)).toHaveLength(0);
            expect(Object.keys(simState.icStates)).toHaveLength(0);
        });
        test("Deleted on Switch should not be in simState", () => {
            const [circuit, _, { Place, TurnOn }] = CreateTestCircuit();
            const [sw] = Place("Switch");
            TurnOn(sw);

            sw.delete();
            const simState = circuit.sim.state;
            expect(Object.keys(simState.signals)).toHaveLength(0);
            expect(Object.keys(simState.states)).toHaveLength(0);
            expect(Object.keys(simState.icStates)).toHaveLength(0);
        });
        test("Deleted IC should not be in simState", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                const [i1, o1] = ICPlace("InputPin", "OutputPin");
                ICConnect(i1, o1);
                icCircuit.name = "To be deleted IC";

                return circuit.createIC({
                    circuit: icCircuit,
                    display: {
                        size: V(4, 2),
                        pins: [
                            { id: i1.outputs[0].id, group: "inputs", name: "In 1", pos: V(-1, -0.5), dir: V(-1, 0) },
                            { id: o1.inputs[0].id, group: "outputs", name: "Out",  pos: V(+1,    0), dir: V(+1, 0) },
                        ],
                    },
                });
            })();
            const [icInstance] = Place(ic.id);
            icInstance.delete();
            const simState = circuit.sim.state;
            expect(Object.keys(simState.signals)).toHaveLength(0);
            expect(Object.keys(simState.states)).toHaveLength(0);
            expect(Object.keys(simState.icStates)).toHaveLength(0);
        });
    });

    describe("Import", () => {
        test("Convert IC to schema and load back in", () => {
            const [circuit, _, { Place }] = CreateTestCircuit();
            const [icCircuit, {}, { Place: ICPlace, Connect: ICConnect }] = CreateTestCircuit();
            const ic = (() => {
                const [i1, i2, g, o1] = ICPlace("InputPin", "InputPin", "ANDGate", "OutputPin");
                ICConnect(i1, g.inputs[0]), ICConnect(i2, g.inputs[1]), ICConnect(g, o1);
                icCircuit.name = "To be serialized IC";

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
            Place(ic.id);

            const [newCircuit, _state, { Place: PlaceNew, Connect: ConnectNew, TurnOn: TurnOnNew }] = CreateTestCircuit();
            newCircuit.import(circuit);
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
        test("Import objects in the circuit with state", () => {
            const [circuit, _, { PlaceAndConnect, TurnOn }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("Switch");

            TurnOn(sw);

            expect(led).toBeOn();

            // Import the objects again with new IDs, switch and LED should still be on
            const objs = circuit.import(
                circuit.createContainer([sw.id, led.id]).withWiresAndPorts(), { refreshIds: true });

            expect(objs.components).toHaveLength(2);
            expect(objs.wires).toHaveLength(1);

            const sw2 = objs.components.find((c) => (c.kind === "Switch"));
            const led2 = objs.components.find((c) => (c.kind === "LED"));
            expect(sw2).toBeDefined();
            expect(led2).toBeDefined();

            expect(circuit.sim.state.states[sw2!.id][0]).toBeOn();
            expect(led).toBeOn();
        });
    });
});
