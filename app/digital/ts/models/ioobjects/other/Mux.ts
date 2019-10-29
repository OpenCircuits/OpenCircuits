import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {XMLNode}      from "core/utils/io/xml/XMLNode";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {MuxSelectPositioner} from "digital/models/ports/positioners/MuxPositioners";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortSet} from "core/models/ports/PortSets";

export abstract class Mux extends DigitalComponent {
    protected selects: PortSet<InputPort>;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue,
                       inputPositioner?: Positioner<InputPort>, outputPositioner?: Positioner<OutputPort>, selectPortCount?: ClampedValue) {
        super(inputPortCount, outputPortCount, V(DEFAULT_SIZE+10, 2*DEFAULT_SIZE), inputPositioner, outputPositioner);

        this.selects = new PortSet<InputPort>(this, new ClampedValue(2, 1, 8), new MuxSelectPositioner(), InputPort);

        if(selectPortCount != null)
            this.setSelectPortCount(selectPortCount.getValue());
        else
            this.setSelectPortCount(2);
    }

    public setSelectPortCount(val: number): void {
        // Calculate size
        const width = Math.max(DEFAULT_SIZE/2*(val-1), DEFAULT_SIZE);
        const height = DEFAULT_SIZE/2*Math.pow(2, val);
        this.transform.setSize(V(width+10, height));

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
    public getInputPorts(): Array<InputPort> {
        return super.getInputPorts().concat(this.selects.getPorts());
    }

    // @Override
    public copy(): Mux {
        const copy = <Mux>super.copy();

        copy.selects = this.selects.copy(copy);

        return copy;
    }

    // @Override
    public save(node: XMLNode): void {
        super.save(node);
        node.addAttribute("selects",this.numSelects());
    }

    // @Override
    public load(node: XMLNode): void {
        super.load(node);
        this.setSelectPortCount(node.getIntAttribute("selects"))
    }

}
