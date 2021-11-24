import {Camera} from "math/Camera";

import {CircuitDesigner} from "core/models";
import {HistoryManager} from "core/actions/HistoryManager";
import {ToolManager} from "core/tools/ToolManager";

import {Input} from "./Input";
import {RenderQueue} from "./RenderQueue";
import {Selectable} from "./Selectable";
import {SelectionsWrapper} from "./SelectionsWrapper";


export type CircuitInfo = {
    locked: boolean;

    input: Input;
    camera: Camera;

    history: HistoryManager;

    designer: CircuitDesigner;

    selections: SelectionsWrapper;
    currentlyPressedObject?: Selectable;

    toolManager: ToolManager;

    renderer: RenderQueue;

    debugOptions: {
        debugCullboxes: boolean,
        debugPressableBounds: boolean,
        debugSelectionBounds: boolean,
        debugNoFill: boolean
    }
}
