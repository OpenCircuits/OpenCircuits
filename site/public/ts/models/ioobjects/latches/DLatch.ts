import {Latch} from "./Latch";

export class DLatch extends Latch {

    public constructor() {
        super(2);
        this.getInputPort(0).setName(">");
        this.getInputPort(1).setName("D");
    }

    // @Override
    public activate(): void {
        this.clock = this.inputs.get(0).getIsOn();
        const data = this.inputs.get(1).getIsOn();
        if (this.clock)
            this.state = data;

        super.activate(this.state, 1);
        super.activate(!this.state, 0);
    }

    public getDisplayName(): string {
        return "D Latch";
    }

    public getXMLName(): string {
        return "dl";
    }
}
