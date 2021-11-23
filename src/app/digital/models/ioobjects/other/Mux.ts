import {DEFAULT_SIZE, MULTIPLEXER_HEIGHT_OFFSET, MUX_DEFAULT_SELECT_PORTS} from "core/utils/Constants";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize} from "serialeazy";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {MuxSelectPositioner} from "digital/models/ports/positioners/MuxSelectPositioners";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortSet} from "core/models/ports/PortSets";
import {DigitalWire} from "digital/models/DigitalWire";
import {Port} from "core/models/ports/Port";

export abstract class Mux extends DigitalComponent {
    @serialize
    protected selects: PortSet<InputPort>;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue,
                       inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>) {
        super(inputPortCount, outputPortCount, Mux.calcSize(MUX_DEFAULT_SELECT_PORTS),
                inputPositioner, outputPositioner);

        this.selects = new PortSet<InputPort>(this, new ClampedValue(MUX_DEFAULT_SELECT_PORTS, 1, 8),
                                                new MuxSelectPositioner(), InputPort);

        this.setSelectPortCount(MUX_DEFAULT_SELECT_PORTS);
    }

    /**
     * Calculates the size for a Mux with a number of selectors.
     * @param ports number of selectors
     * @returns a Vector of the size for a Mux
     */
    public static calcSize(ports: number): Vector {
        return V((0.5 + ports/2) * DEFAULT_SIZE, (1 + Math.pow(2, ports - 1)) * DEFAULT_SIZE);
    }

    public setSelectPortCount(val: number): void {
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

}
