import {ANDGate, DigitalNode, DigitalObj, DigitalPort, DigitalWire, XNORGate} from "core/models/types/digital";

import {NodeView}                 from "core/views/NodeView";
import {ViewRecord}               from "core/views/ViewManager";
import {WireView}                 from "core/views/WireView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

import {ANDGateView}     from "./components/ANDGateView";
import {XNORGateView}    from "./components/XNORGateView";
import {DigitalPortView} from "./DigitalPortView";


class DigitalWireView extends WireView<DigitalWire, DigitalCircuitController> {}
class DigitalNodeView extends NodeView<DigitalNode, DigitalCircuitController> {}

export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "DigitalWire": (c: DigitalCircuitController, o: DigitalWire) => new DigitalWireView(c, o),
    "DigitalPort": (c: DigitalCircuitController, o: DigitalPort) => new DigitalPortView(c, o),
    "DigitalNode": (c: DigitalCircuitController, o: DigitalNode) => new DigitalNodeView(c, o),
    "ANDGate":     (c: DigitalCircuitController, o: ANDGate)     => new ANDGateView(c, o),
    "XNORGate":    (c: DigitalCircuitController, o: XNORGate)    => new XNORGateView(c, o),
};
