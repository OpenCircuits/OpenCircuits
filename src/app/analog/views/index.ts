import {V} from "Vector";

import {AnyPort} from "core/models/types";

import {AnalogNode, AnalogObj, AnalogPort, AnalogWire} from "core/models/types/analog";

import {ComponentView}           from "core/views/ComponentView";
import {NodeView}                from "core/views/NodeView";
import {PortView}                from "core/views/PortView";
import {ViewFactory, ViewRecord} from "core/views/ViewManager";
import {WireView}                from "core/views/WireView";

import {AnalogViewInfo} from "./AnalogViewInfo";
import { OscilloscopeView } from "./Components/OscilloscopeView";


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
    //can use ground.svg and resistor.svg since they are statically drawn components, meanign that they don't change over time like some other components 
    //such as the capacitor.
    "Ground":   (c, o) => new ComponentView(c, o, V(1.2, 0.6), "ground.svg"),
    "Resistor": (c, o) => new ComponentView(c, o, V(1.2, 1), "resistor.svg"),
    //Note to change the "View" when creating a custom view, don't use ComponentView when making the Oscilloscope, otherwise it won't work when placing it down. 
    "Oscilloscope":   (c, o) => new OscilloscopeView (c,o),

};

export function CreateView(info: AnalogViewInfo, obj: AnalogObj) {
    const view = Views[obj.kind] as ViewFactory<AnalogObj, AnalogViewInfo>;
    return (view(info, obj));
}
