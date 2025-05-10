import "shared/api/circuit/tests/helpers/Extensions";

import {ToolConfig} from "shared/api/circuitdesigner/public/impl/CircuitDesigner";

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

import {InteractionHandler} from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";

import {SetupMockCanvas} from "shared/api/circuitdesigner/tests/helpers/CreateTestCircuitDesigner";

import {CreateDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {DigitalTypes} from "digital/api/circuit/public/impl/DigitalCircuitState";
import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";


export function GetDefaultTools(): ToolConfig<DigitalTypes> {
    return {
        defaultTool: new DefaultTool(
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipNodesHandler, DeselectAllHandler,
            InteractionHandler,  // Needs to be before the selection handler
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

export function CreateCircuitDesigner(toolConfig = GetDefaultTools()) {
    const [circuit, state, helpers] = CreateTestCircuit();

    const designer = CreateDesigner(toolConfig, [], -1, [circuit, state]);

    const [mockInput, canvas] = SetupMockCanvas(designer);

    return [designer, mockInput, canvas, helpers] as const;
}
