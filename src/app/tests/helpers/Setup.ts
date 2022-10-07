import {V} from "Vector";

import {Camera} from "math/Camera";

import {RenderQueue}       from "core/utils/RenderQueue";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {HistoryManager} from "core/actions/HistoryManager";

import {DefaultTool}      from "core/tools/DefaultTool";
import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";
import {RotateTool}       from "core/tools/RotateTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";
import {SplitWireTool}    from "core/tools/SplitWireTool";
import {Tool}             from "core/tools/Tool";
import {ToolManager}      from "core/tools/ToolManager";
import {TranslateTool}    from "core/tools/TranslateTool";
import {WiringTool}       from "core/tools/WiringTool";

import {CleanUpHandler}       from "core/tools/handlers/CleanUpHandler";
import {DeleteHandler}        from "core/tools/handlers/DeleteHandler";
import {DeselectAllHandler}   from "core/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}     from "core/tools/handlers/DuplicateHandler";
import {FitToScreenHandler}   from "core/tools/handlers/FitToScreenHandler";
import {RedoHandler}          from "core/tools/handlers/RedoHandler";
import {SelectAllHandler}     from "core/tools/handlers/SelectAllHandler";
import {SelectionHandler}     from "core/tools/handlers/SelectionHandler";
import {SelectPathHandler}    from "core/tools/handlers/SelectPathHandler";
import {SnipWirePortsHandler} from "core/tools/handlers/SnipWirePortsHandler";
import {UndoHandler}          from "core/tools/handlers/UndoHandler";

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
                WiringTool, SplitWireTool, SelectionBoxTool],
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
/**
 * This function generates basic objects usefule when testing.
 *
 * @param props                 Optional parameters to pass in.
 * @param props.propagationTime The propagation time for the designer. Defaults to 0 (no delay).
 * @param props.screenSize      The size fo the test screen.
 * @returns                       Everything in DigitalCircuitInfo except "input", a fake input, and a reset function.
 */
export function Setup(props?: Props): Omit<DigitalCircuitInfo, "input"> &
                                      {input: FakeInput, reset: (d?: boolean) => void} {
    const propagationTime = props?.propagationTime ?? 0;
    const screenSize = props?.screenSize ?? [500, 500];
    const tools = props?.tools ?? GetDefaultTools();

    const camera = new Camera(...screenSize);
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(propagationTime);
    const selections = new SelectionsWrapper();
    const renderer = new RenderQueue();
    const toolManager = new ToolManager(tools.defaultTool, ...tools.tools!);
    const input = new FakeInput(camera);

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
            debugCullboxes:       false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
            debugNoFill:          false,
        },

        // Utility function to reset the state of the CircuitInfo
        reset: (resetDesigner = false) => {
            history.reset();
            camera.setPos(V()); camera.setZoom(0.02); // Reset camera
            if (resetDesigner)
                designer.reset();
            input.reset();
            selections.get().forEach((s) => selections.deselect(s)); // Reset selections
            toolManager.reset(info);
        },
    };

    input.addListener((ev) => toolManager.onEvent(ev, info));

    return info;
}
