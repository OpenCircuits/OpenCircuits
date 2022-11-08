import {DefaultTool} from "core/tools/DefaultTool";
import {Tool}        from "core/tools/Tool";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";


import {AppStore} from "site/digital/state";

import {CreateInfo}                   from "./CreateInfo";
import {GetDigitalCircuitInfoHelpers} from "./DigitalCircuitInfoHelpers";


export function Setup(store: AppStore, defaultTool: DefaultTool,
                      ...tools: Tool[]): [DigitalCircuitInfo, CircuitInfoHelpers] {
    const [info, reset] = CreateInfo(defaultTool, ...tools);

    // Setup view
    info.circuit.subscribe((ev) => {
        if (ev.type === "obj") {
            if (ev.op === "added")
                info.viewManager.onAddObj(ev.obj);
            else if (ev.op === "removed")
                info.viewManager.onRemoveObj(ev.obj);
            else if (ev.op === "edited")
                info.viewManager.onEditObj(ev.obj, ev.prop, ev.val);
        }
    });

    // Setup propagation
    info.circuit.subscribe((ev) => {
        if (ev.type === "obj") {
            if (ev.op === "added")
                info.sim.onAddObj(ev.obj);
            else if (ev.op === "removed")
                info.sim.onRemoveObj(ev.obj);
            // @TODO: Maybe onEditObj?
        }
    });

    // Setup input listener
    info.input.subscribe((ev) => {
        const change = info.toolManager.onEvent(ev, info);
        if (change)
            info.renderer.render();
    });

    // Add render callbacks and set render function
    info.sim.subscribe((ev) => {
        if (ev.type === "step") // Re-render when the propagation steps
            info.renderer.render();
    });

    return [info, GetDigitalCircuitInfoHelpers(store, info, reset)];
}
