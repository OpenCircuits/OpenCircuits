import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";
import {Multiplexer}     from "digital/models/ioobjects/other/Multiplexer";

import {ActionManager}          from "core/actions/ActionManager";
import {SelectPortChangeAction} from "digital/actions/ports/SelectPortChangeAction";
import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {CreateBusAction}        from "digital/actions/addition/BusActionFactory";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";
import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";
// import {PlaceAction}     from "../../../../../site/public/ts/utils/actions/";

describe("Integration Tests for Actions", () => {
    test("Bus 5 switches to 3s Mux", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new ActionManager();

        const a = new Switch();
        const b = new Switch();
        const c = new Switch();
        const d = new Switch();
        const e = new Switch();

        const m = new Multiplexer();


        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b,c,d,e,m]).execute())

               .add(new SelectPortChangeAction(m, 3).execute())

               .add(CreateBusAction([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                                    [m,m,m,m,m].map((m,i) => m.getInputPort(i))).execute())

               .undo().undo().undo()
               .redo().redo().redo()
               .undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
    test("Bus 5 switches to 3s Mux then change to 2s Mux", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new ActionManager();

        const a = new Switch();
        const b = new Switch();
        const c = new Switch();
        const d = new Switch();
        const e = new Switch();

        const m = new Multiplexer();


        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b,c,d,e,m]).execute())

               .add(new SelectPortChangeAction(m, 3).execute())

               .add(CreateBusAction([a,b,c,d,e].map((s)   => s.getOutputPort(0)),
                                    [m,m,m,m,m].map((m,i) => m.getInputPort(i))).execute())

               .add(new SelectPortChangeAction(m, 2).execute())

               .undo().undo().undo().undo()
               .redo().redo().redo().redo()
               .undo().undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
    test("Connect Switch -> LED, Split Wire, then Undo everything", () => {
        const designer = new DigitalCircuitDesigner(0);
        const manager = new ActionManager();

        const a = new Switch();
        const b = new LED();
        const n = new DigitalNode();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);

        manager.add(CreateGroupPlaceAction(designer, [a,b]).execute())

               .add(new ConnectionAction(a.getOutputPort(0), b.getInputPort(0)).execute())

               .add(CreateSplitWireAction(a.getOutputs()[0], n).execute())

               .undo().undo().undo()
               .redo().redo().redo()
               .undo().undo().undo();

        expect(designer.getObjects().length).toBe(0);
        expect(designer.getWires().length).toBe(0);
    });
});
