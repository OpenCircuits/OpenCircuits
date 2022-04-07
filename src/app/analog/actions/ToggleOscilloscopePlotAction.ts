import {Action} from "core/actions/Action";

import {Oscilloscope} from "analog/models/eeobjects";


export class ToggleOscilloscopePlotAction implements Action {
    private o: Oscilloscope;

    private id: `${string}.${string}`;

    private target: boolean;

    public constructor(o: Oscilloscope, id: `${string}.${string}`, target: boolean) {
        this.o = o;
        this.id = id;
        this.target = target;
    }

    public execute(): Action {
        if (this.target === true)
            this.o.enableVec(this.id);
        else
            this.o.disableVec(this.id);

        return this;
    }

    public undo(): Action {
        if (this.target === true)
            this.o.enableVec(this.id);
        else
            this.o.disableVec(this.id);

        return this;
    }

    public getName(): string {
        return `Toggled plot ${this.id}`;
    }

}