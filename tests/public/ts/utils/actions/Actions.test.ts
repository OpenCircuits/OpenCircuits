import "jest";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {Multiplexer}     from "../../../../../site/public/ts/models/ioobjects/other/Multiplexer";

import {ActionManager}          from "../../../../../site/public/ts/utils/actions/ActionManager";
import {SelectPortChangeAction} from "../../../../../site/public/ts/utils/actions/ports/SelectPortChangeAction";
import {CreateGroupPlaceAction} from "../../../../../site/public/ts/utils/actions/addition/PlaceAction";
import {CreateBusAction}        from "../../../../../site/public/ts/utils/actions/addition/BusActionFactory";
// import {PlaceAction}     from "../../../../../site/public/ts/utils/actions/";

describe("Integration Tests for Actions", () => {
    it("Bus 5 switches to 3s Mux", () => {
        const designer = new CircuitDesigner(0);
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
    it("Bus 5 switches to 3s Mux then change to 2s Mux", () => {
        const designer = new CircuitDesigner(0);
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
});
