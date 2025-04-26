import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {V} from "Vector";


describe("Clock", () => {
    test("Turns off/on expectedly", () => {
        const [circuit, { sim }] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 4); // 4-cycle delay

        // Get initial state
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOn();
    });
    test("Changing delay resets cycle", () => {
        const [circuit, { sim }] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 10);

        // Get initial state
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();

        // 7 steps left till activation
        // Change to delay of 2
        clock.setProp("delay", 2);
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOn();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOn();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOn();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOn();
        sim.step();
        expect(sim.getState(clock.id)![0]).toBeOff();
        sim.step();  // This is where the original value of 10 would activate and flip it to on
        expect(sim.getState(clock.id)![0]).toBeOff();
    });
});
