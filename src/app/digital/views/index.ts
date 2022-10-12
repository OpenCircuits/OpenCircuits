import {DigitalNode, DigitalObj, DigitalWire} from "core/models/types/digital";

import {ViewCircuitInfo}          from "core/views/BaseView";
import {NodeView}                 from "core/views/NodeView";
import {ViewFactory, ViewRecord}  from "core/views/ViewManager";
import {WireView}                 from "core/views/WireView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

import {ANDGateView}     from "./components/ANDGateView";
import {LEDView}         from "./components/LEDView";
import {SwitchView}      from "./components/SwitchView";
import {DigitalPortView} from "./DigitalPortView";


class DigitalWireView extends WireView<DigitalWire, DigitalCircuitController> {}
class DigitalNodeView extends NodeView<DigitalNode, DigitalCircuitController> {}

export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "DigitalWire": (c, o) => new DigitalWireView(c, o),
    "DigitalPort": (c, o) => new DigitalPortView(c, o),
    "DigitalNode": (c, o) => new DigitalNodeView(c, o),

    "Switch":  (c, o) => new SwitchView(c, o),
    "LED":     (c, o) => new LEDView(c, o),
    "ANDGate": (c, o) => new ANDGateView(c, o),
};

export function CreateView(info: ViewCircuitInfo<DigitalCircuitController>, obj: DigitalObj) {
    const view = Views[obj.kind] as ViewFactory<DigitalObj, DigitalCircuitController>;
    return (view(info, obj));
}
