import {GUID}          from "core/internal";
import {CircuitView}   from "core/internal/view/CircuitView";
import {ComponentView} from "core/internal/view/ComponentView";
import {ANDGateView}   from "./components/ANDGateView";
import {LEDView}       from "./components/LEDView";
import {SwitchView}    from "./components/SwitchView";


const viewMap = {
    "ANDGate": ANDGateView,
    "Switch":  SwitchView,
    "LED":     LEDView,
};

export class DigitalCircuitView extends CircuitView {
    protected constructComponentView(kind: string, id: GUID): ComponentView {
        if (!(kind in viewMap))
            throw new Error(`Failed to construct view for kind ${kind}! Unmapped!`);
        return new viewMap[kind as keyof typeof viewMap](id, this.state);
    }
}
