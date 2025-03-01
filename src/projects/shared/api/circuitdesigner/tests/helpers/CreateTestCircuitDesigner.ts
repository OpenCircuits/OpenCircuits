import "shared/api/circuit/tests/helpers/Extensions";

import {setupJestCanvasMock} from "jest-canvas-mock";

import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {CircuitDesignerImpl}  from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CircuitDesignerState} from "shared/api/circuitdesigner/public/impl/CircuitDesignerState";
import {ToolManager}          from "shared/api/circuitdesigner/public/impl/ToolManager";
import {ToolConfig}           from "shared/api/circuitdesigner/public/impl/Viewport";

import {DefaultTool}      from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}          from "shared/api/circuitdesigner/tools/PanTool";
import {TranslateTool}    from "shared/api/circuitdesigner/tools/TranslateTool";
import {SelectionBoxTool} from "shared/api/circuitdesigner/tools/SelectionBoxTool";
import {RotateTool}       from "shared/api/circuitdesigner/tools/RotateTool";
import {WiringTool}       from "shared/api/circuitdesigner/tools/WiringTool";
import {SplitWireTool}    from "shared/api/circuitdesigner/tools/SplitWireTool";

import {CleanupHandler}     from "shared/api/circuitdesigner/tools/handlers/CleanupHandler";
import {CopyHandler}        from "shared/api/circuitdesigner/tools/handlers/CopyHandler";
import {DeleteHandler}      from "shared/api/circuitdesigner/tools/handlers/DeleteHandler";
import {DeselectAllHandler} from "shared/api/circuitdesigner/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}   from "shared/api/circuitdesigner/tools/handlers/DuplicateHandler";
import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {PasteHandler}       from "shared/api/circuitdesigner/tools/handlers/PasteHandler";
import {RedoHandler}        from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import {SaveHandler}        from "shared/api/circuitdesigner/tools/handlers/SaveHandler";
import {SelectAllHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectAllHandler";
import {SelectionHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectionHandler";
import {SelectPathHandler}  from "shared/api/circuitdesigner/tools/handlers/SelectPathHandler";
import {SnipNodesHandler}   from "shared/api/circuitdesigner/tools/handlers/SnipNodesHandler";
import {UndoHandler}        from "shared/api/circuitdesigner/tools/handlers/UndoHandler";
import {ZoomHandler}        from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";

import {CreateTestRootCircuit} from "shared/api/circuit/tests/helpers/CreateTestCircuit";
import {MockInputFacade} from "./MockInputFacade";


export function GetDefaultTools() {
    return {
        defaultTool: new DefaultTool(
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipNodesHandler, DeselectAllHandler,
            SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
            CleanupHandler, CopyHandler, PasteHandler, ZoomHandler,
            SaveHandler(() => {})
        ),
        tools: [
            PanTool,
            new RotateTool(), new TranslateTool(),
            new WiringTool(), new SplitWireTool(),
            new SelectionBoxTool(),
        ],
    };
}

export function CreateTestCircuitDesigner(toolConfig: ToolConfig = GetDefaultTools()) {
    const [circuit, state] = CreateTestRootCircuit();

    // create view and attach toolConfig.renderers as post-process rendering

    const designerState: CircuitDesignerState<CircuitTypes> = {
        circuitState: state,

        curCamera: "main",
        cameras:   {
            "main": {
                x:    0,
                y:    0,
                zoom: 0.02,
            },
        },

        toolManager: new ToolManager(toolConfig.defaultTool, toolConfig.tools),

        curPressedObj: undefined,
        cursor:        undefined,
        margin:        { left: 0, right: 0, top: 0, bottom: 0 },
        debugOptions:  {
            debugCullboxes:       false,
            debugNoFill:          false,
            debugPressableBounds: false,
            debugSelectionBounds: false,
        },
    };

    const designer = CircuitDesignerImpl(circuit, designerState, new Map(), { dragTime: -1 });

    setupJestCanvasMock();
    const canvas = document.createElement("canvas");

    canvas.width = 100, canvas.height = 100;
    canvas.getBoundingClientRect = () => ({
        width: 100, height: 100, left: 0, top: 0,
    } as DOMRect);

    designer.viewport.attachCanvas(canvas);

    return [designer, new MockInputFacade(designer.viewport.camera, canvas), canvas] as const;
}
