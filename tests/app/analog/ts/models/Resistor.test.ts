import "jest";

import {Resistor} from "analog/models/eeobjects/Resistor";

describe("Resistor", () => {
    describe("New Resistor, Default", () => {
        const resistor = new Resistor();

        expect(resistor.getResistance()).toBe(5);
    });
    describe("Example Resistors", () => {
        it ("Positive Resistance", () => {
            const resistor = new Resistor(2);
            expect(resistor.getResistance()).toBe(2);
        });
    });
});
