import {RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";
import {CircuitInternal}   from "shared/api/circuit/internal/impl/CircuitInternal";
import {RenderHelper}      from "./RenderHelper";


export interface RenderState {
    circuit:    CircuitInternal;
    renderer:   RenderHelper;
    options:    RenderOptions;
}
