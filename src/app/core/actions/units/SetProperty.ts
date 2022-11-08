import {GUID} from "core/utils/GUID";

import {Action} from "core/actions/Action";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


type TProp = string | number | boolean;

class SetPropertyAction implements Action {
    private readonly circuit: CircuitController<AnyObj>;
    private readonly objID: GUID;

    private readonly propKey: string;

    private readonly initialProp: TProp;
    private readonly targetProp: TProp;

    public constructor(circuit: CircuitController<AnyObj>, objID: GUID, key: string, prop: TProp) {
        this.circuit = circuit;
        this.objID = objID;
        this.propKey = key;
        this.initialProp = circuit.getPropFrom(circuit.getObj(objID)!, key);
        this.targetProp = prop;

        this.execute();
    }

    public execute(): Action {
        this.circuit.setPropFor(this.circuit.getObj(this.objID)!, this.propKey, this.targetProp);

        return this;
    }

    public undo(): Action {
        this.circuit.setPropFor(this.circuit.getObj(this.objID)!, this.propKey, this.initialProp);

        return this;
    }

    public getName(): string {
        return `Changed Property ${this.propKey}`;
    }

    public getCustomInfo(): string[] {
        return [`From ${this.initialProp} to ${this.targetProp}`];
    }
}

export function SetProperty(circuit: CircuitController<AnyObj>, objID: GUID, key: string, prop: TProp) {
    return new SetPropertyAction(circuit, objID, key, prop);
}
