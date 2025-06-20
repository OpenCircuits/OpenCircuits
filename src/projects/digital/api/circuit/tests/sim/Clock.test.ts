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
    test("Sync clocks", () => {
        const [_, { sim }, { Place }] = CreateTestCircuit(false);

        const [c1] = Place("Clock");
        c1.setProp("delay", 5);

        // Step a few times
        sim.step();
        sim.step();

        // Then add a second clock
        const [c2] = Place("Clock");
        c2.setProp("delay", 5);

        sim.step();

        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        sim.step();
        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOn();
        expect(sim.getState(c2.id)![0]).toBeOff();

        // Now sync them
        sim.resetQueueForComp(c1.id);
        sim.resetQueueForComp(c2.id);

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOff();
        expect(sim.getState(c2.id)![0]).toBeOff();

        sim.step();
        expect(sim.getState(c1.id)![0]).toBeOn();
        expect(sim.getState(c2.id)![0]).toBeOn();
    });
});
