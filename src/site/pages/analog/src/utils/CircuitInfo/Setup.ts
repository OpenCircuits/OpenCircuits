import {RefObject} from "react";

import {DefaultTool} from "core/tools/DefaultTool";
import {Tool}        from "core/tools/Tool";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {NGSpiceLib} from "analog/models/sim/lib/NGSpiceLib";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {AppStore} from "site/analog/state";

import {GetAnalogCircuitInfoHelpers} from "./AnalogCircuitInfoHelpers";
import {CreateInfo}                  from "./CreateInfo";


export function Setup(store: AppStore, canvas: RefObject<HTMLCanvasElement>, ngSpiceLib: NGSpiceLib,
                      defaultTool: DefaultTool, ...tools: Tool[]): [AnalogCircuitInfo, CircuitInfoHelpers] {
    const info = CreateInfo(ngSpiceLib, defaultTool, ...tools);
    return [info, GetAnalogCircuitInfoHelpers(store, canvas, info)];
}
