import {V} from "Vector";

import {AnyPort} from "core/models/types";

import {AnalogNode, AnalogObj, AnalogPort, AnalogWire, Resistor} from "core/models/types/analog";

import {AnalogCircuitController} from "analog/controllers/AnalogCircuitController";
import {RenderInfo}              from "core/views/BaseView";
import {ComponentView}           from "core/views/ComponentView";
import {NodeView}                from "core/views/NodeView";
import {PortView}                from "core/views/PortView";
import {ViewRecord}              from "core/views/ViewManager";
import {WireView}                from "core/views/WireView";


class AnalogWireView extends WireView<AnalogWire, AnalogCircuitController> {}
class AnalogNodeView extends NodeView<AnalogNode, AnalogCircuitController> {}

class AnalogPortView extends PortView<AnalogPort, AnalogCircuitController> {
    public override isWireable(): boolean {
        return true;
    }
    public override isWireableWith(_: AnyPort): boolean {
        return true;
    }
}

class ResistorView extends ComponentView<Resistor, AnalogCircuitController> {
    public constructor(circuit: AnalogCircuitController, obj: Resistor) {
        super(circuit, obj, V(1.2, 1), "resistor.svg");
    }
    protected override renderComponent(_: RenderInfo): void {}
}

export const Views: ViewRecord<AnalogObj, AnalogCircuitController> = {
    "AnalogWire": (c: AnalogCircuitController, o: AnalogWire) => new AnalogWireView(c, o),
    "AnalogPort": (c: AnalogCircuitController, o: AnalogPort) => new AnalogPortView(c, o),
    "AnalogNode": (c: AnalogCircuitController, o: AnalogNode) => new AnalogNodeView(c, o),
    "Resistor":   (c: AnalogCircuitController, o: Resistor)   => new ResistorView(c, o),
};
