import "jest";

import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {DigitalCircuitDesigner} from "digital/models";
import {ANDGate, LED, ORGate, Switch} from "digital/models/ioobjects";

import {GetHelpers} from "test/helpers/Helpers";


describe("CreateReplaceDigitalComponentAction", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});

    test("ANDGate -> ORGate", () => {
        const [a, b, and, out] = Place(new Switch(), new Switch(), new ANDGate(), new LED());
        const or = new ORGate();

        Connect(a, 0, and, 0);
        Connect(b, 0, and, 1);
        Connect(and, 0, out, 0);

        // Initial
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeFalsy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeFalsy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();

        // Replaced
        const action = CreateReplaceDigitalComponentAction(designer, and, or);
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeTruthy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeTruthy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();

        // Undo
        action.undo();
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeFalsy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeFalsy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();
    });
});
