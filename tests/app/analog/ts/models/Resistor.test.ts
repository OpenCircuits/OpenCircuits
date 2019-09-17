import "jest";

import {Resistor} from "analog/models/eeobjects/Resistor";

describe("Resistor", () => {
    describe("New Resistor, Default", () => {
        const resistor = new Resistor();

        expect(resistor.getResistance()).toBe(1000);
    });
    describe("Example Resistors", () => {
        it ("Positive Resistance", () => {
            const resistor = new Resistor(2);
            expect(resistor.getResistance()).toBe(2);
        });
        it ("Negative Resistance", () => {
            //Should default to 1k Ohms
            const resistor = new Resistor(-1);
            expect(resistor.getResistance()).toBe(1000);
        });
        it ("Zero Resistance", () => {
            //Should default to 1k Ohms
            const resistor = new Resistor(0);
            expect(resistor.getResistance()).toBe(1000);
        });
    });
});
