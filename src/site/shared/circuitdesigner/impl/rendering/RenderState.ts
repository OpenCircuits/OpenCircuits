import {Schema}            from "core/schema";
import {CircuitInternal}   from "core/internal/impl/CircuitInternal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {RenderHelper}      from "./RenderHelper";
import {RenderOptions}     from "shared/circuitdesigner/impl/rendering/RenderOptions";


export interface RenderState {
    circuit:    CircuitInternal;
    selections: SelectionsManager;
    camera:     Schema.Camera;
    renderer:   RenderHelper;
    options:    RenderOptions;
}
