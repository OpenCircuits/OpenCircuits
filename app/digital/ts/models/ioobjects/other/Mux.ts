import {DEFAULT_SIZE, MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize} from "serialeazy";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {MuxSelectPositioner} from "digital/models/ports/positioners/MuxPositioners";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortSet} from "core/models/ports/PortSets";
import {DigitalWire} from "digital/models/DigitalWire";
import {Port} from "core/models/ports/Port";

export abstract class Mux extends DigitalComponent {
    @serialize
    protected selects: PortSet<InputPort>;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue,
                       inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>) {
        super(inputPortCount, outputPortCount, V(DEFAULT_SIZE+10, 2*DEFAULT_SIZE), inputPositioner, outputPositioner);

        this.selects = new PortSet<InputPort>(this, new ClampedValue(2, 1, 8), new MuxSelectPositioner(), InputPort);

        this.setSelectPortCount(2);
        this.setBinaryLabels();
    }

    public setSelectPortCount(val: number): void {
        // Calculate size
        const width = Math.max(DEFAULT_SIZE/2*(val-1), DEFAULT_SIZE) + 10;
        const height = DEFAULT_SIZE/2*Math.pow(2, val);
        this.transform.setSize(V(width, height));

        this.selects.setPortCount(val);
    }

    public getSelectPorts(): Array<InputPort> {
        return this.selects.getPorts();
    }

    public getSelectPortCount(): ClampedValue {
        return this.selects.getCount();
    }

    public numSelects(): number {
        return this.selects.length;
    }

    // @Override
    public getOffset(): Vector {
        return super.getOffset().add(0, MULTIPLEXER_HEIGHT_OFFSET/2);
    }

    // @Override
    public getInputs(): DigitalWire[] {
        // Get each wire connected to each InputPort
        //  and then filter out the null ones
        return super.getInputs().concat(
            this.getSelectPorts().map((p) => p.getInput())
                    .filter((w) => w != null));
    }

    // @Override
    public getPorts(): Port[] {
        return super.getPorts().concat(this.getSelectPorts());
    }

    public abstract getLabeledPorts(): Port[];

    public setBinaryLabels(): void {
        const ports = this.getLabeledPorts();
        const digitCount = Math.log2(ports.length);
        let numStr = "0".repeat(digitCount);

        for (let i = 0; i < Math.pow(2, digitCount); i++) {
            ports[i].setName(numStr);
            numStr = (numStr.substr(0, numStr.lastIndexOf("0")) + "1").padEnd(digitCount, "0");
        }
    }
}
