import {RefObject} from "react";

import {DefaultTool} from "core/tools/DefaultTool";
import {Tool}        from "core/tools/Tool";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {AppStore} from "site/digital/state";

import {CreateInfo}                   from "./CreateInfo";
import {GetDigitalCircuitInfoHelpers} from "./DigitalCircuitInfoHelpers";



export function Setup(store: AppStore, canvas: RefObject<HTMLCanvasElement>, defaultTool: DefaultTool,
                      ...tools: Tool[]): [DigitalCircuitInfo, CircuitInfoHelpers] {
    const info = CreateInfo(defaultTool, ...tools);

    return [info, GetDigitalCircuitInfoHelpers(store, canvas, info)];
}
