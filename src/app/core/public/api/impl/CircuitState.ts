import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";

import {Circuit}   from "../Circuit";
import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";


// Utility object to pass around the Circuit API state to the API Component/Port/etc
export type CircuitState<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
    CircuitT extends Circuit = Circuit,
> = CircuitT & {
    circuit: CircuitInternal;

    view: CircuitView;

    selectionsManager: SelectionsManager;

    isLocked: boolean;

    constructComponent(id: string): ComponentT;
    constructWire(id: string): WireT;
    constructPort(id: string): PortT;
}
