import {DigitalNode, DigitalObj} from "core/models/types/digital";

import {NodeView}                from "core/views/NodeView";
import {ViewFactory, ViewRecord} from "core/views/ViewManager";

import {ANDGateView}        from "./components/ANDGateView";
import {ConstantNumberView} from "./components/ConstantNumberView";
import {LEDView}            from "./components/LEDView";
import {SwitchView}         from "./components/SwitchView";
import {DigitalPortView}    from "./DigitalPortView";
import {DigitalViewInfo}    from "./DigitalViewInfo";
import {DigitalWireView}    from "./DigitalWireView";


class DigitalNodeView extends NodeView<DigitalNode, DigitalViewInfo> {}

export const Views: ViewRecord<DigitalObj, DigitalViewInfo> = {
    "DigitalWire": (c, o) => new DigitalWireView(c, o),
    "DigitalPort": (c, o) => new DigitalPortView(c, o),
    "DigitalNode": (c, o) => new DigitalNodeView(c, o),

    "Switch":         (c, o) => new SwitchView(c, o),
    "LED":            (c, o) => new LEDView(c, o),
    "ANDGate":        (c, o) => new ANDGateView(c, o),
    "ConstantNumber": (c, o) => new ConstantNumberView(c, o),
};

export function CreateView(info: DigitalViewInfo, obj: DigitalObj) {
    const view = Views[obj.kind] as ViewFactory<DigitalObj, DigitalViewInfo>;
    return (view(info, obj));
}
