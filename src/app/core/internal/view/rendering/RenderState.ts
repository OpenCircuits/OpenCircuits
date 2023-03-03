import {CircuitInternal}   from "core/internal/impl/CircuitInternal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {Matrix2x3}         from "math/Matrix";
import {RenderHelper}      from "./RenderHelper";
import {RenderOptions}     from "./RenderOptions";


export interface RenderState {
    circuit:    CircuitInternal;
    selections: SelectionsManager;
    cameraMat:  Matrix2x3;
    renderer:   RenderHelper;
    options:    RenderOptions;
}
