import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";


// Utility object to pass around the Circuit API state to the API Component/Port/etc
export interface CircuitState {
    circuit: CircuitInternal;
    view?: CircuitView;

    selections: SelectionsManager;

    isLocked: boolean;
}
