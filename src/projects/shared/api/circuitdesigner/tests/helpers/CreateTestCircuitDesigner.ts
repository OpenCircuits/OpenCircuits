import "shared/api/circuit/tests/helpers/Extensions";

import {setupJestCanvasMock} from "jest-canvas-mock";

import {CircuitDesigner, ToolConfig} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {CircuitDesignerImpl} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";

import {DefaultTool}      from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}          from "shared/api/circuitdesigner/tools/PanTool";
import {TranslateTool}    from "shared/api/circuitdesigner/tools/TranslateTool";
import {SelectionBoxTool} from "shared/api/circuitdesigner/tools/SelectionBoxTool";
import {RotateTool}       from "shared/api/circuitdesigner/tools/RotateTool";
import {WiringTool}       from "shared/api/circuitdesigner/tools/WiringTool";
import {SplitWireTool}    from "shared/api/circuitdesigner/tools/SplitWireTool";

import {CleanupHandler}     from "shared/api/circuitdesigner/tools/handlers/CleanupHandler";
import {DeleteHandler}      from "shared/api/circuitdesigner/tools/handlers/DeleteHandler";
import {DeselectAllHandler} from "shared/api/circuitdesigner/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}   from "shared/api/circuitdesigner/tools/handlers/DuplicateHandler";
import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {RedoHandler}        from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import {SaveHandler}        from "shared/api/circuitdesigner/tools/handlers/SaveHandler";
import {SelectAllHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectAllHandler";
import {SelectionHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectionHandler";
import {SelectPathHandler}  from "shared/api/circuitdesigner/tools/handlers/SelectPathHandler";
import {SnipNodesHandler}   from "shared/api/circuitdesigner/tools/handlers/SnipNodesHandler";
import {UndoHandler}        from "shared/api/circuitdesigner/tools/handlers/UndoHandler";
import {ZoomHandler}        from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";

import {CreateTestCircuitHelpers, TestCircuitImpl} from "shared/api/circuit/tests/helpers/CreateTestCircuit";

import {MockInputFacade} from "./MockInputFacade";
import {uuid} from "shared/api/circuit/public";


export function GetDefaultTools(): ToolConfig {
    return {
        defaultTool: new DefaultTool(
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipNodesHandler, DeselectAllHandler,
            SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
            CleanupHandler, ZoomHandler,
            // CopyHandler,
            // PasteHandler,
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
    const circuit = new TestCircuitImpl(uuid());
    const designer = new CircuitDesignerImpl(circuit, circuit["ctx"], new Map(), { dragTime: -1, toolConfig });

    const [mockInput, canvas] = SetupMockCanvas(designer);
    return [designer, mockInput, canvas, CreateTestCircuitHelpers(circuit)] as const;
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
