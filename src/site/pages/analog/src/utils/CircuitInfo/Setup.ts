import {RefObject} from "react";

import {DefaultTool} from "core/tools/DefaultTool";
import {Tool} from "core/tools/Tool";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {AppStore} from "site/analog/state";

import {CreateInfo} from "./CreateInfo";
import {GetAnalogCircuitInfoHelpers} from "./AnalogCircuitInfoHelpers";


export function Setup(store: AppStore, canvas: RefObject<HTMLCanvasElement>,
                      defaultTool: DefaultTool, ...tools: Tool[]): [AnalogCircuitInfo, CircuitInfoHelpers] {
    const info = CreateInfo(defaultTool, ...tools);
    return [info, GetAnalogCircuitInfoHelpers(store, canvas, info)];
}
