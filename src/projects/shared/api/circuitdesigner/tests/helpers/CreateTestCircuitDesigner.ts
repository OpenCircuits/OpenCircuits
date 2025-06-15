import "shared/api/circuit/tests/helpers/Extensions";

import {setupJestCanvasMock} from "jest-canvas-mock";

import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";

import {CircuitDesignerImpl, ToolConfig} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";
import {CircuitDesignerState} from "shared/api/circuitdesigner/public/impl/CircuitDesignerState";
import {ToolManager}          from "shared/api/circuitdesigner/public/impl/ToolManager";

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

import {CreateTestCircuit} from "shared/api/circuit/tests/helpers/CreateTestCircuit";
import {MockInputFacade} from "./MockInputFacade";
import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";


export function GetDefaultTools(): ToolConfig {
    return {
        defaultTool: new DefaultTool(
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipNodesHandler, DeselectAllHandler,
            SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
            CleanupHandler, CopyHandler, PasteHandler, ZoomHandler,
            SaveHandler(() => {})
        ),
        tools: [
            new PanTool(),
            new RotateTool(), new TranslateTool(),
            new WiringTool(), new SplitWireTool(),
            new SelectionBoxTool(),
        ],
    };
}

export function CreateTestCircuitDesigner(toolConfig: ToolConfig = GetDefaultTools()) {
    const [circuit, state, helpers] = CreateTestCircuit();

    // create view and attach toolConfig.renderers as post-process rendering

    const designerState: CircuitDesignerState<CircuitTypes> = {
        circuitState: state,

        toolManager: new ToolManager(toolConfig.defaultTool, toolConfig.tools),

        isLocked:      false,
        curPressedObj: undefined,
        margin:        { left: 0, right: 0, top: 0, bottom: 0 },
        debugOptions:  {
            debugPrims:              false,
            debugPrimBounds:         false,
            debugPrimOrientedBounds: false,

            debugComponentBounds: false,
            debugPortBounds:      false,
            debugWireBounds:      false,

            debugPressableBounds: false,
        },
    };

    const designer = new CircuitDesignerImpl(circuit, designerState, new Map(), { dragTime: -1 });
    const [mockInput, canvas] = SetupMockCanvas(designer);

    return [designer, mockInput, canvas, helpers] as const;
}

export function SetupMockCanvas(designer: CircuitDesigner) {
    setupJestCanvasMock();
    const canvas = document.createElement("canvas");

    canvas.width = 100, canvas.height = 100;
    canvas.getBoundingClientRect = () => ({
        width: 100, height: 100, left: 0, top: 0,
    } as DOMRect);

    designer.viewport.attachCanvas(canvas);

    return [new MockInputFacade(designer.viewport, canvas), canvas] as const;
}
