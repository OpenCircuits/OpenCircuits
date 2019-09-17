import "jest";

import {CurrentSource} from "analog/models/eeobjects/CurrentSource";

describe("Current Source", () => {
    describe("New Current Source, Default", () => {
        const csource = new CurrentSource();
        //Default to .005 Amps
        expect(csource.getCurrent()).toBe(.005);
    });
    describe("Example Current Sources", () => {
        it ("Positive Current", () => {
            const csource = new CurrentSource(.002);
            expect(csource.getCurrent()).toBe(.002);
        });
        it ("Negative Current", () => {
            //Should default to .005 Amps
            const csource = new CurrentSource(-1);
            expect(csource.getCurrent()).toBe(.005);
        });
        it ("Zero Current", () => {
            //Should default to .005 Amps
            const csource = new CurrentSource(0);
            expect(csource.getCurrent()).toBe(.005);
        });
    });
});
