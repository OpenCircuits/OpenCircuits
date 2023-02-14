import {CircuitInternal} from "core/internal/impl/CircuitInternal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CameraView} from "../CameraView";
import {RenderHelper} from "./RenderHelper";
import {RenderOptions} from "./RenderOptions";


export interface RenderState {
    circuit: CircuitInternal;
    selections: SelectionsManager;
    camera: CameraView;
    renderer: RenderHelper;
    options: RenderOptions;
}