import {V} from "Vector";

import {AnyPort} from "core/models/types";

import {AnalogNode, AnalogObj, AnalogPort, AnalogWire} from "core/models/types/analog";

import {ComponentView}           from "core/views/ComponentView";
import {NodeView}                from "core/views/NodeView";
import {PortView}                from "core/views/PortView";
import {ViewFactory, ViewRecord} from "core/views/ViewManager";
import {WireView}                from "core/views/WireView";

import {AnalogViewInfo} from "./AnalogViewInfo";


class AnalogWireView extends WireView<AnalogWire, AnalogViewInfo> {}
class AnalogNodeView extends NodeView<AnalogNode, AnalogViewInfo> {}

class AnalogPortView extends PortView<AnalogPort, AnalogViewInfo> {
    public override isWireable(): boolean {
        return true;
    }
    public override isWireableWith(_: AnyPort): boolean {
        return true;
    }
}

export const Views: ViewRecord<AnalogObj, AnalogViewInfo> = {
    "AnalogWire": (c, o) => new AnalogWireView(c, o),
    "AnalogPort": (c, o) => new AnalogPortView(c, o),
    "AnalogNode": (c, o) => new AnalogNodeView(c, o),
    //Capacitance view with the updated downsize from the old master code. These dimensions are updated by 1/50th of the original dimensions from master.
    //Capacitor.svg is statically drawn and preset.
    "Capacitor":  (c, o) => new ComponentView (c, o, V(0.4, 1.2), "capacitor.svg"),
    "Resistor":   (c, o) => new ComponentView (c, o, V(1.2, 1),   "resistor.svg" ),
    "Ground":     (c, o) => new ComponentView (c, o, V(1.2, 0.6), "ground.svg"   ),
};

export function CreateView(info: AnalogViewInfo, obj: AnalogObj) {
    const view = Views[obj.kind] as ViewFactory<AnalogObj, AnalogViewInfo>;
    return (view(info, obj));
}
