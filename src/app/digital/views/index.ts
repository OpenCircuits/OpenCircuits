<<<<<<< HEAD
import {DigitalNode, DigitalObj} from "core/models/types/digital";
=======
import {ANDGate, DigitalNode, DigitalObj, DigitalPort, DigitalWire, JKFlipFlop} from "core/models/types/digital";
>>>>>>> b1d665fd16e5756e8c7ef6b8a80bac877f4702bb

import {NodeView}                 from "core/views/NodeView";
import {ViewFactory, ViewRecord}  from "core/views/ViewManager";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

import {ANDGateView}     from "./components/ANDGateView";
import {JKFlipFlopView}  from "./components/JKFlipFlopView";
<<<<<<< HEAD
import {LEDView}         from "./components/LEDView";
import {SwitchView}      from "./components/SwitchView";
=======
>>>>>>> b1d665fd16e5756e8c7ef6b8a80bac877f4702bb
import {DigitalPortView} from "./DigitalPortView";
import {DigitalViewInfo} from "./DigitalViewInfo";
import {DigitalWireView} from "./DigitalWireView";


class DigitalNodeView extends NodeView<DigitalNode, DigitalViewInfo> {}

<<<<<<< HEAD
export const Views: ViewRecord<DigitalObj, DigitalViewInfo> = {
    "DigitalWire": (c, o) => new DigitalWireView(c, o),
    "DigitalPort": (c, o) => new DigitalPortView(c, o),
    "DigitalNode": (c, o) => new DigitalNodeView(c, o),

    "Switch":     (c, o) => new SwitchView(c, o),
    "LED":        (c, o) => new LEDView(c, o),
    "ANDGate":    (c, o) => new ANDGateView(c, o),
    "JKFlipFlop": (c, o) => new JKFlipFlopView(c, o),
=======
export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "DigitalWire": (c: DigitalCircuitController, o: DigitalWire) => new DigitalWireView(c, o),
    "DigitalPort": (c: DigitalCircuitController, o: DigitalPort) => new DigitalPortView(c, o),
    "DigitalNode": (c: DigitalCircuitController, o: DigitalNode) => new DigitalNodeView(c, o),
    "ANDGate":     (c: DigitalCircuitController, o: ANDGate)     => new ANDGateView(c, o),
    "JKFlipFlop":  (c: DigitalCircuitController, o: JKFlipFlop)  => new JKFlipFlopView(c, o),
>>>>>>> b1d665fd16e5756e8c7ef6b8a80bac877f4702bb
};

export function CreateView(info: DigitalViewInfo, obj: DigitalObj) {
    const view = Views[obj.kind] as ViewFactory<DigitalObj, DigitalViewInfo>;
    return (view(info, obj));
}
