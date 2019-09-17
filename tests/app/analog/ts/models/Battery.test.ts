import "jest";

import {Battery} from "../../../../site/public/ts/models/eeobjects/Battery";

describe("Battery", () => {
    describe("New Battery, Default", () => {
        const battery = new Battery();
        //Default to 5 Volt
        expect(battery.getVoltage()).toBe(5);
    });
    describe("Example Batteries", () => {
        it ("Positive Voltage", () => {
            const battery = new Battery(2);
            expect(battery.getVoltage()).toBe(2);
        });
        it ("Negative Voltage", () => {
            //Should default to 5 Volt
            const battery = new Battery(-1);
            expect(battery.getVoltage()).toBe(5);
        });
        it ("Zero Voltage", () => {
            //Should default to 5 Volt
            const battery = new Battery(0);
            expect(battery.getVoltage()).toBe(5);
        });
    });
});
