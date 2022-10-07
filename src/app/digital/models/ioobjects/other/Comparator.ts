import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {PortsToDecimal} from "digital/utils/ComponentUtils";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {OutputPort} from "digital/models/ports/OutputPort";

import {ComparatorPositioner} from "digital/models/ports/positioners/ComparatorPositioner";


@serializable("Comparator")
export class Comparator extends DigitalComponent {
    public static readonly LT_PORT = 0;
    public static readonly EQ_PORT = 1;
    public static readonly GT_PORT = 2;

    public constructor() {
        super(new ClampedValue(4, 2, 16), new ClampedValue(3),
              V(1.25, 2),
              new ComparatorPositioner("left", 1),
              new ConstantSpacePositioner<OutputPort>("right", 1));

        this.activate();
        this.setInputPortCount(2);

        this.getOutputPort(Comparator.LT_PORT).setName("<");
        this.getOutputPort(Comparator.EQ_PORT).setName("=");
        this.getOutputPort(Comparator.GT_PORT).setName(">");
    }

    public override setInputPortCount(val: number): void {
        if (val % 2 !== 0)
            throw new Error(`Attempted to set Comparator inputs to be odd! ${val}!`);

        this.setSize(V(1.25, val/2+0.5));
        super.setInputPortCount(val);

        this.getInputPorts()
            .slice(0,this.getInputPortCount().getValue()/2)
            .forEach((port, i) => port.setName("a"+i));
        this.getInputPorts()
            .slice(this.getInputPortCount().getValue()/2)
            .forEach((port, i) => port.setName("b"+i));
    }

    public override activate(): void {
        const a = PortsToDecimal(this.getInputPorts().slice(0,this.getInputPortCount().getValue()/2));
        const b = PortsToDecimal(this.getInputPorts().slice(this.getInputPortCount().getValue()/2));
        super.activate(a  <  b, Comparator.LT_PORT);
        super.activate(a === b, Comparator.EQ_PORT);
        super.activate(a  >  b, Comparator.GT_PORT);
    }

    public override getDisplayName(): string {
        return "Comparator";
    }
}
