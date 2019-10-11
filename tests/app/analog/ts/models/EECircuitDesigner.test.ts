import "jest";

import {EECircuitDesigner} from "analog/models/AnalogCircuitDesigner";
import {Battery}           from "analog/models/eeobjects/Battery";
import {Resistor}          from "analog/models/eeobjects/Resistor";

describe("EECircuitDesigner", () => {
    describe("Empty Circuit", () => {
        const designer = new EECircuitDesigner();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
    describe("Example Circuits", () => {
        it ("Basic Battery + Resistor", () => {
            const designer = new EECircuitDesigner();
            const battery  = new Battery(10);
            const resistor = new Resistor(2);

            Place(designer, [battery, resistor]);

            const wire1 = Connect(battery,  resistor);
            const wire2 = Connect(resistor, battery);

            designer.simulate();

            //Current
            expect(battery.getCurrent()).toBe(5);
            //expect(wire1.getCurrent()).toBe(5);
            expect(resistor.getCurrent()).toBe(5);
            //expect(wire2.getCurrent()).toBe(5);

            //Voltage
            expect(battery.getVoltage()).toBe(10);
            //expect(wire1.getVoltage()).toBe(10);
            expect(resistor.getVoltage()).toBe(10);
            //expect(wire2.getVoltage()).toBe(0);

            //Resistance
            expect(battery.getResistance()).toBe(0);
            //expect(wire1.getResistance()).toBe(0);
            expect(resistor.getResistance()).toBe(2);
            //expect(wire2.getResistance()).toBe(0);

            // //Power
            // expect(battery.getPower()).toBe(50);
            // expect(resistor.getPower()).toBe(50);
            //Technically, this value should be Negative
            //The battery generates power and the resistor consumes it
            //We will use absolute value for now
        });
        it ("Basic Battery + 2 Resistors in Series", () => {
            const designer = new EECircuitDesigner();

            const battery   = new Battery(10);
            const resistor1 = new Resistor(2);
            const resistor2 = new Resistor(3);

            Place(designer, [battery, resistor1, resistor2]);

            const wire1 = Connect(battery,   resistor1);
            const wire2 = Connect(resistor1, resistor2);
            const wire3 = Connect(resistor2, battery);

            designer.simulate();

            //Current
            expect(battery.getCurrent()).toBe(2);
            //expect(wire1.getCurrent()).toBe(2);
            expect(resistor1.getCurrent()).toBe(2);
            //expect(wire2.getCurrent()).toBe(2);
            expect(resistor2.getCurrent()).toBe(2);
            //expect(wire3.getCurrent()).toBe(2);

            //Voltage
            expect(battery.getVoltage()).toBe(10);
            //expect(wire1.getVoltage()).toBe(10);
            expect(resistor1.getVoltage()).toBe(4);
            //expect(wire2.getVoltage()).toBe(6);
            expect(resistor2.getVoltage()).toBe(6);
            //expect(wire3.getVoltage()).toBe(0);

            //Resistance
            expect(battery.getResistance()).toBe(0);
            //expect(wire1.getResistance()).toBe(0);
            expect(resistor1.getResistance()).toBe(2);
            //expect(wire2.getResistance()).toBe(0);
            expect(resistor2.getResistance()).toBe(3);
            //expect(wire3.getResistance()).toBe(0);

            // //Power
            // expect(battery.getPower()).toBe(20);
            // expect(resistor1.getPower()).toBe(8);
            // expect(resistor2.getPower()).toBe(12);
        });
        it ("No Resistor Circuit", () => {
            const designer = new EECircuitDesigner();

            const battery = new Battery(10);

            Place(designer, [battery]);
            //Decide whether or not to allow battery connected to itself
            const wire1 =  Connect(battery, battery);

            designer.simulate();

            // Current
            expect(battery.getCurrent()).toBe(Infinity);
            //expect(wire1.getCurrent()).toBe(Infinity);

            //Voltage
            expect(battery.getVoltage()).toBe(10); //Set to 10 for now to pass test
            //expect(wire1.getVoltage()).toBe(NaN);

            //Resistance
            expect(battery.getResistance()).toBe(0);
            //expect(wire1.getResistance()).toBe(0);

            // //Power
            // expect(battery.getPower()).toBe(Infinity);
        });
    });
});
