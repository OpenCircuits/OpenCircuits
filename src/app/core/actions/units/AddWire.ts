import {CircuitDesigner, Wire} from "core/models";

import {Action} from "../Action";


// TODO: delete this once model refactor is done
class AddWireAction implements Action {
    private readonly designer: CircuitDesigner;
    private readonly wire: Wire;

    public constructor(designer: CircuitDesigner, wire: Wire) {
        this.designer = designer;
        this.wire = wire;

        this.execute();
    }

    public execute() {
        this.designer.addWire(this.wire);

        return this;
    }

    public undo() {
        this.designer.removeWire(this.wire);

        return this;
    }

    public getName(): string {
        return "Added Wire Action"
    }
}

export function AddWire(designer: CircuitDesigner, wire: Wire) {
    return new AddWireAction(designer, wire);
}
