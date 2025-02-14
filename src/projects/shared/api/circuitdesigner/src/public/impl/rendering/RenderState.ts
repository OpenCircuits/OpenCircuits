import {Schema}            from "shared/api/circuit/schema";
import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";
import {CircuitInternal}   from "shared/api/circuit/internal/impl/CircuitInternal";
import {SelectionsManager} from "shared/api/circuit/internal/impl/SelectionsManager";
import {RenderHelper}      from "./RenderHelper";


export interface RenderState {
    circuit:    CircuitInternal;
    selections: SelectionsManager;
    camera:     Schema.Camera;
    renderer:   RenderHelper;
    options:    RenderOptions;
}
