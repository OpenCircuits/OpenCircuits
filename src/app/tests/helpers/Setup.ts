import {Camera} from "math/Camera";

import {SelectionsWrapper} from "core/utils/SelectionsWrapper";
import {RenderQueue} from "core/utils/RenderQueue";

import {HistoryManager} from "core/actions/HistoryManager";

import {DefaultTool}      from "core/tools/DefaultTool";
import {Tool}             from "core/tools/Tool";
import {ToolManager}      from "core/tools/ToolManager";
import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";
import {RotateTool}       from "core/tools/RotateTool";
import {TranslateTool}    from "core/tools/TranslateTool";
import {WiringTool}       from "core/tools/WiringTool";
import {SplitWireTool}    from "core/tools/SplitWireTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";

import {SelectAllHandler}     from "core/tools/handlers/SelectAllHandler";
import {FitToScreenHandler}   from "core/tools/handlers/FitToScreenHandler";
import {DuplicateHandler}     from "core/tools/handlers/DuplicateHandler";
import {DeleteHandler}        from "core/tools/handlers/DeleteHandler";
import {SnipWirePortsHandler} from "core/tools/handlers/SnipWirePortsHandler";
import {DeselectAllHandler}   from "core/tools/handlers/DeselectAllHandler";
import {SelectionHandler}     from "core/tools/handlers/SelectionHandler";
import {SelectPathHandler}    from "core/tools/handlers/SelectPathHandler";
import {UndoHandler}          from "core/tools/handlers/UndoHandler";
import {RedoHandler}          from "core/tools/handlers/RedoHandler";
import {CleanUpHandler}       from "core/tools/handlers/CleanUpHandler";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import {FakeInput} from "./FakeInput";


export function GetDefaultTools() {
    return {
        defaultTool: new InteractionTool([
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
            SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
            CleanUpHandler,
        ]),
        tools: [PanTool, RotateTool, TranslateTool,
                WiringTool, SplitWireTool, SelectionBoxTool]
    };
}


type Props = {
    propagationTime?: number;
    screenSize?: [number, number];
    tools?: {
        defaultTool: DefaultTool;
        tools?: Tool[];
    };
}
export function Setup(props?: Props): Omit<DigitalCircuitInfo, "input"> & {input: FakeInput} {
    const propagationTime = props?.propagationTime ?? -1;
    const screenSize = props?.screenSize ?? [500, 500];
    const tools = props?.tools ?? GetDefaultTools();

    const camera = new Camera(...screenSize);
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(propagationTime);
    const selections = new SelectionsWrapper();
    const renderer = new RenderQueue();
    const toolManager = new ToolManager(tools.defaultTool, ...tools.tools!);
    const input = new FakeInput(camera.getCenter());

    const info = {
        locked: false,
        history,
        camera,
        designer,
        input,
        selections,
        toolManager,
        renderer,
        debugOptions: {
            debugCullboxes: false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
            debugNoFill: false
        }
    };

    input.addListener((ev) => toolManager.onEvent(ev, info));

    return info;
}
