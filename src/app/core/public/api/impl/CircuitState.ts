import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";

import {Circuit}   from "../Circuit";
import {Component} from "../Component";
import {Port}      from "../Port";
import {Wire}      from "../Wire";


// Utility object to pass around the Circuit API state to the API Component/Port/etc
export interface CircuitState extends Circuit {
    circuit: CircuitInternal;
    view?: CircuitView;

    selections: SelectionsManager;

    isLocked: boolean;

    constructComponent(id: string): Component;
    constructWire(id: string): Wire;
    constructPort(id: string): Port;
}
