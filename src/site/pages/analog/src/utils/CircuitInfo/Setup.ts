import {RefObject} from "react";

import {DefaultTool} from "core/tools/DefaultTool";
import {Tool}        from "core/tools/Tool";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {NGSpiceLib} from "analog/models/sim/lib/NGSpiceLib";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {AppStore} from "site/analog/state";

import {GetAnalogCircuitInfoHelpers} from "./AnalogCircuitInfoHelpers";
import {CreateInfo}                  from "./CreateInfo";


export function Setup(store: AppStore, ngSpiceLib: NGSpiceLib,
                      defaultTool: DefaultTool, ...tools: Tool[]): [AnalogCircuitInfo, CircuitInfoHelpers] {
    const [info, reset] = CreateInfo(ngSpiceLib, defaultTool, ...tools);

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

    // Add input listener
    info.input.subscribe((ev) => {
        const change = info.toolManager.onEvent(ev, info);
        if (change)
            info.renderer.render();
    });

    return [info, GetAnalogCircuitInfoHelpers(store, info, reset)];
}
