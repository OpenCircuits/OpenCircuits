import {Camera} from "math/Camera";

import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {RenderQueue} from "core/utils/RenderQueue";

import {HistoryManager} from "core/actions/HistoryManager";
import {DefaultTool} from "core/tools/DefaultTool";

import {Tool} from "core/tools/Tool";
import {ToolManager} from "core/tools/ToolManager";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import { IOObject } from "core/models";


export function CreateInfo(defaultTool: DefaultTool, ...tools: Tool[]): DigitalCircuitInfo {
    const camera = new Camera();
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(1);
    const selections = new SelectionsWrapper();
    const clipboard = new Array<IOObject>();
    const renderer = new RenderQueue();
    const toolManager = new ToolManager(defaultTool, ...tools);

    const info = {
        locked: false,
        history,
        camera,
        designer,
        input: undefined,
        selections,
        clipboard,
        toolManager,
        renderer
    } as DigitalCircuitInfo;

    return info;
}
