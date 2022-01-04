import {serializable} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {V}            from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {DigitalComponent}     from "digital/models/DigitalComponent";
import {OutputPort}           from "digital/models/ports/OutputPort";
import {ComparatorPositioner} from "digital/models/ports/positioners/ComparatorPositioner";

import {PortsToDecimal} from "digital/utils/ComponentUtils";


@serializable("Comparator")
export class Comparator extends DigitalComponent {
    public static readonly LT_PORT = 0;
    public static readonly EQ_PORT = 1;
    public static readonly GT_PORT = 2;

    public constructor() {
        super(new ClampedValue(4, 2, 16),
              new ClampedValue(3),
              V(DEFAULT_SIZE*1.25, DEFAULT_SIZE*2),
              new ComparatorPositioner("left", DEFAULT_SIZE),
              new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE));

        this.activate();
        this.setInputPortCount(2);
        
        this.getOutputPort(Comparator.LT_PORT).setName("<");        
        this.getOutputPort(Comparator.EQ_PORT).setName("=");
        this.getOutputPort(Comparator.GT_PORT).setName(">");
    }

    public setInputPortCount(val: number): void {
        this.setSize(V(DEFAULT_SIZE*1.25, DEFAULT_SIZE*(val+0.5)));
        super.setInputPortCount(2*val);

        this.getInputPorts()
            .slice(0,this.getInputPortCount().getValue()/2)
            .forEach((port, i) => port.setName("a"+i));
        this.getInputPorts()
            .slice(this.getInputPortCount().getValue()/2)
            .forEach((port, i) => port.setName("b"+i));
    }

    public activate(): void {
        const a = PortsToDecimal(this.getInputPorts().slice(0,this.getInputPortCount().getValue()/2));
        const b = PortsToDecimal(this.getInputPorts().slice(this.getInputPortCount().getValue()/2));
        super.activate(a  <  b, Comparator.LT_PORT);
        super.activate(a === b, Comparator.EQ_PORT);
        super.activate(a  >  b, Comparator.GT_PORT);
    }

    public getDisplayName(): string {
        return "Comparator";
    }
}