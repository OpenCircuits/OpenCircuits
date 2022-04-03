import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Oscilloscope} from "digital/models/ioobjects/outputs/Oscilloscope";


export class OscilloscopeSizeChangeAction implements Action {
    private oscilloscope: Oscilloscope;

    private initialSize: Vector;
    private targetSize: Vector;

    public constructor(oscilloscope: Oscilloscope, targetSize: Vector) {
        this.oscilloscope = oscilloscope;

        this.initialSize = oscilloscope.getDisplaySize();
        this.targetSize = targetSize;
    }

    public execute(): Action {
        this.oscilloscope.setDisplaySize(this.targetSize);

        return this;
    }

    public undo(): Action {
        this.oscilloscope.setDisplaySize(this.initialSize);

        return this;
    }

    public getName(): string {
        return "Changed the size of the Oscilloscope";
    }

}
