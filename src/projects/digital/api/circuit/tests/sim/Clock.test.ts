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
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        sim.step();
        expect(clock).toBeOn();
    });
    test("Changing delay resets cycle", () => {
        const [circuit, { sim }] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 10);

        // Get initial state
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        // 7 steps left till activation
        // Change to delay of 2
        clock.setProp("delay", 2);
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOff();
        sim.step();  // This is where the original value of 10 would activate and flip it to on
        expect(clock).toBeOff();
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

        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        sim.step();
        sim.step();
        expect(c1).toBeOn();
        expect(c2).toBeOff();

        // Now sync them
        sim.resetQueueForComp(c1.id);
        sim.resetQueueForComp(c2.id);

        sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        sim.step();
        expect(c1).toBeOn();
        expect(c2).toBeOn();
    });
    test("Pause clock", () => {
        const [circuit, { sim }] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 4); // 4-cycle delay

        // Get initial state
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        clock.setProp("paused", true);

        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        clock.setProp("paused", false);

        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        sim.step();
        expect(clock).toBeOn();
    });
    test("Pause clock and change delay", () => {
        const [circuit, { sim }] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 10);

        // Get initial state
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        // Pause clock
        clock.setProp("paused", true);
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        // 7 steps left till activation
        // Change to delay of 2
        clock.setProp("delay", 2);
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();

        // Unpause
        clock.setProp("paused", false);

        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOff();
        sim.step();
        expect(clock).toBeOn();
        sim.step();
        expect(clock).toBeOn();
    });
});
