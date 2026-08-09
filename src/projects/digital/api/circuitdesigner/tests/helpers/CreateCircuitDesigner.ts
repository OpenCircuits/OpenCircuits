import "shared/api/circuit/tests/helpers/Extensions";
import { uuid } from "shared/api/circuit/public";

import { InstantSimRunner } from "digital/api/circuit/internal/sim/DigitalSimRunner";
import { DigitalCircuitImpl } from "digital/api/circuit/public/impl/DigitalCircuit";
import { DigitalAPITypes } from "digital/api/circuit/public/impl/DigitalCircuitContext";
import { CreateTestCircuitHelpers } from "digital/api/circuit/tests/helpers/CreateTestCircuit";

import { ToolConfig } from "shared/api/circuitdesigner/public/CircuitDesigner";
import { SetupMockCanvas } from "shared/api/circuitdesigner/tests/helpers/CreateTestCircuitDesigner";
import { DefaultTool } from "shared/api/circuitdesigner/tools/DefaultTool";
import { CleanupHandler } from "shared/api/circuitdesigner/tools/handlers/CleanupHandler";
import { DeleteHandler } from "shared/api/circuitdesigner/tools/handlers/DeleteHandler";
import { DeselectAllHandler } from "shared/api/circuitdesigner/tools/handlers/DeselectAllHandler";
import { DuplicateHandler } from "shared/api/circuitdesigner/tools/handlers/DuplicateHandler";
import { FitToScreenHandler } from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import { RedoHandler } from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import { SaveHandler } from "shared/api/circuitdesigner/tools/handlers/SaveHandler";
import { SelectAllHandler } from "shared/api/circuitdesigner/tools/handlers/SelectAllHandler";
import { SelectionHandler } from "shared/api/circuitdesigner/tools/handlers/SelectionHandler";
import { SelectPathHandler } from "shared/api/circuitdesigner/tools/handlers/SelectPathHandler";
import { SnipNodesHandler } from "shared/api/circuitdesigner/tools/handlers/SnipNodesHandler";
import { UndoHandler } from "shared/api/circuitdesigner/tools/handlers/UndoHandler";
import { ZoomHandler } from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";
import { PanTool } from "shared/api/circuitdesigner/tools/PanTool";
import { RotateTool } from "shared/api/circuitdesigner/tools/RotateTool";
import { SelectionBoxTool } from "shared/api/circuitdesigner/tools/SelectionBoxTool";
import { SplitWireTool } from "shared/api/circuitdesigner/tools/SplitWireTool";
import { TranslateTool } from "shared/api/circuitdesigner/tools/TranslateTool";
import { WiringTool } from "shared/api/circuitdesigner/tools/WiringTool";

import { CreateDesigner } from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import { InteractionHandler } from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";

export function GetDefaultTools(): ToolConfig<DigitalAPITypes> {
    return {
        defaultTool: new DefaultTool(
            SelectAllHandler,
            FitToScreenHandler,
            DuplicateHandler,
            DeleteHandler,
            SnipNodesHandler,
            DeselectAllHandler,
            InteractionHandler, // Needs to be before the selection handler
            SelectionHandler,
            SelectPathHandler,
            RedoHandler,
            UndoHandler,
            CleanupHandler,
            ZoomHandler,
            // CopyHandler,
            // PasteHandler,
            SaveHandler(() => {}),
        ),
        tools: [
            new PanTool(),
            new RotateTool(),
            new TranslateTool(),
            new WiringTool(),
            new SplitWireTool(),
            new SelectionBoxTool(),
        ],
    };
}

export function CreateCircuitDesigner(toolConfig = GetDefaultTools(), sim = true) {
    const circuit = new DigitalCircuitImpl(uuid());

    if (sim) {
        circuit["ctx"].simRunner = new InstantSimRunner(circuit["ctx"].sim);
    }

    const designer = CreateDesigner(toolConfig, [], -1, circuit);

    const [mockInput, canvas] = SetupMockCanvas(designer);

    return [designer, mockInput, canvas, CreateTestCircuitHelpers(circuit)] as const;
}
