import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {RenderQueue} from "core/utils/RenderQueue";

import {HistoryManager} from "core/actions/HistoryManager";
import {DefaultTool} from "core/tools/DefaultTool";

import {Tool} from "core/tools/Tool";
import {ToolManager} from "core/tools/ToolManager";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {AnalogCircuitDesigner} from "analog/models";


export function CreateInfo(defaultTool: DefaultTool, ...tools: Tool[]): AnalogCircuitInfo {
    const camera = new Camera();
    const history = new HistoryManager();
    const designer = new AnalogCircuitDesigner();
    const selections = new SelectionsWrapper();
    const renderer = new RenderQueue();
    const toolManager = new ToolManager(defaultTool, ...tools);

    const info: AnalogCircuitInfo = {
        locked: false,
        history,
        camera,
        designer,
        // This is necessary because input is created later in the pipeline because it requires canvas
        input: undefined as unknown as Input,
        selections,
        toolManager,
        renderer,
        debugOptions: {
            debugCullboxes: false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
            debugNoFill: false,
        },
    };

    return info;
}
