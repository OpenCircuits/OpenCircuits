import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {V} from "Vector";


describe("Clock", () => {
    test("Turns off/on expectedly", () => {
        const [circuit] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 4); // 4-cycle delay

        // Get initial state
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        circuit.sim.step();
        expect(clock).toBeOn();
    });
    test("Changing delay resets cycle", () => {
        const [circuit] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 10);

        // Get initial state
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        // 7 steps left till activation
        // Change to delay of 2
        clock.setProp("delay", 2);
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();  // This is where the original value of 10 would activate and flip it to on
        expect(clock).toBeOff();
    });
    test("Sync clocks", () => {
        const [circuit, { Place }] = CreateTestCircuit(false);

        const [c1] = Place("Clock");
        c1.setProp("delay", 5);

        // Step a few times
        circuit.sim.step();
        circuit.sim.step();

        // Then add a second clock
        const [c2] = Place("Clock");
        c2.setProp("delay", 5);

        circuit.sim.step();

        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        circuit.sim.step();
        circuit.sim.step();
        expect(c1).toBeOn();
        expect(c2).toBeOff();

        // Now sync them
        circuit.sim.sync([c1.id, c2.id]);

        circuit.sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        expect(c1).toBeOff();
        expect(c2).toBeOff();

        circuit.sim.step();
        expect(c1).toBeOn();
        expect(c2).toBeOn();
    });
    test("Pause clock", () => {
        const [circuit] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 4); // 4-cycle delay

        // Get initial state
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        clock.setProp("paused", true);

        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        clock.setProp("paused", false);

        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        circuit.sim.step();
        expect(clock).toBeOn();
    });
    test("Pause clock and change delay", () => {
        const [circuit] = CreateTestCircuit(false);

        const clock = circuit.placeComponentAt("Clock", V(0, 0));
        clock.setProp("delay", 10);

        // Get initial state
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        // Pause clock
        clock.setProp("paused", true);
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        // 7 steps left till activation
        // Change to delay of 2
        clock.setProp("delay", 2);
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();

        // Unpause
        clock.setProp("paused", false);

        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOff();
        circuit.sim.step();
        expect(clock).toBeOn();
        circuit.sim.step();
        expect(clock).toBeOn();
    });
});
