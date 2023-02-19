import {GUID}            from "core/internal";
import {CircuitView}     from "core/internal/view/CircuitView";
import {ComponentView}   from "core/internal/view/ComponentView";
import {WireView}        from "core/internal/view/WireView";
import {ANDGateView}     from "./components/ANDGateView";
import {LEDView}         from "./components/LEDView";
import {SwitchView}      from "./components/SwitchView";
import {DigitalWireView} from "./DigitalWireView";


const viewMap = {
    "ANDGate": ANDGateView,
    "Switch":  SwitchView,
    "LED":     LEDView,
};

export class DigitalCircuitView extends CircuitView {
    protected override constructComponentView(kind: string, id: GUID): ComponentView {
        if (!(kind in viewMap))
            throw new Error(`Failed to construct view for kind ${kind}! Unmapped!`);
        return new viewMap[kind as keyof typeof viewMap](id, this.state);
    }
    protected override constructWireView(kind: string, id: string): WireView {
        return new DigitalWireView(id, this.state, this.componentViews);
    }
}
