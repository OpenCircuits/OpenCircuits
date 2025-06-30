import {CreateView}        from "analog/views";
import {AnalogViewInfo}    from "analog/views/AnalogViewInfo";
import {CircuitController} from "shared/api/circuit/controllers/CircuitController";
import {ViewManager}       from "shared/api/circuit/views/ViewManager";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {InputManager}      from "shared/api/circuit/utils/InputManager";
import {RenderQueue}       from "shared/api/circuit/utils/RenderQueue";
import {SelectionsWrapper} from "shared/api/circuit/utils/SelectionsWrapper";

import {HistoryManager} from "shared/api/circuit/actions/HistoryManager";

import {DefaultTool} from "shared/api/circuit/tools/DefaultTool";
import {Tool}        from "shared/api/circuit/tools/Tool";
import {ToolManager} from "shared/api/circuit/tools/ToolManager";

import {Circuit, DefaultCircuit} from "shared/api/circuit/models/Circuit";

import {AnalogObj} from "shared/api/circuit/models/types/analog";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {AnalogSim} from "analog/models/sim/AnalogSim";

import {NGSpiceLib} from "analog/models/sim/lib/NGSpiceLib";


export function CreateInfo(ngSpiceLib: NGSpiceLib | undefined,
                           defaultTool: DefaultTool, ...tools: Tool[]) {
    const camera = new Camera();
    const history = new HistoryManager();

    const circuit = new CircuitController<AnalogObj>(DefaultCircuit(), "AnalogWire", "AnalogNode");
    const sim = (ngSpiceLib ? new AnalogSim(ngSpiceLib) : undefined);

    const viewManager = new ViewManager<AnalogObj, AnalogViewInfo>(
        { circuit, sim }, CreateView
    );

    const input = new InputManager();

    const selections = new SelectionsWrapper();
    const renderer = new RenderQueue();
    const toolManager = new ToolManager(defaultTool, ...tools);

    const info: AnalogCircuitInfo = {
        locked: false,
        history,
        camera,
        circuit,
        viewManager,
        sim,

        // This is necessary because input is created later in the pipeline because it requires canvas
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
    };

    const reset = (c?: Circuit<AnalogObj>) => {
        // info.camera =  new Camera();
        info.camera.setPos(V());
        info.camera.setZoom(0.02);

        selections.get().forEach((id) => selections.deselect(id));
        history.reset();

        // Reset circuit
        circuit.reset(c);
        viewManager.reset(c);

        renderer.render();
    }

    return [info, reset] as const;
}
