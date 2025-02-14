import {Vector} from "Vector";

import {CircleContains} from "math/MathUtils";

import {MinDist} from "shared/api/circuit/utils/Reducers";

import {Circuit, Port} from "shared/api/circuit/public";

import {CircuitDesigner}                       from "shared/api/circuitdesigner/public/CircuitDesigner";
import {LEFT_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";
import {InputAdapterEvent}                     from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {Tool}                                  from "./Tool";
import {Viewport} from "shared/api/circuitdesigner/public/Viewport";


// The distance away from the port in selection for wiring.
export const WIRING_PORT_SELECT_RADIUS = 0.34;

export class WiringTool implements Tool {
    protected curPort: Port | undefined;

    /** Field to help differentiate between this tool when activated with a click vs drag. */
    protected stateType: "clicked" | "dragged" | undefined;

    /**
     * Utility function to help find the port to begin/end wiring.
     *
     * @param pos       The position to look for ports around.
     * @param circuit   The circuit that contains the ports to look at.
     * @param viewport  The circuit's viewport.
     * @param otherPort An optional "other port" that means we should look for a port that can connect with this one.
     * @returns         The found port, otherwise undefined if none were found.
     */
    protected findPort(pos: Vector, circuit: Circuit, viewport: Viewport, otherPort?: Port): Port | undefined {
        // This is not as straightforward at just picking the port that's over the cursor, because:
        // 1. If there are multiple ports close together, if one is "above" the other, it would get iterated
        //     first but the cursor might be closer to the "lower" one and the user most likely wants the closest one.
        // 2. If the closest port already has a connection and can't be wired,
        //     we probably want to find the next closest.
        const worldPos = viewport.camera.toWorldPos(pos);

        // First see if there is a port that we are directly within the bounds of
        const p1 = circuit.pickPortAt(worldPos);
        if (p1)
            return p1;

        // Otherwise, gather all ports that are within the wireable
        //  bounds (and can be wired), and find the closest one
        const allPorts = circuit.getObjs()
            .filter((obj) => (obj.baseKind === "Port")) as Port[];
        const validPorts = allPorts
            // Make sure port is wireable
            .filter((port) => !port.getLegalWires().isEmpty)
            // Find only ports that are within the selection radius
            .filter((port) => CircleContains(port.targetPos, WIRING_PORT_SELECT_RADIUS, worldPos))
            // If `otherPort` is specified, then make sure we also only look for ports that
            //  can connect to `otherPort`
            .filter((port) => (!otherPort ? true : port.getLegalWires().contains(otherPort)));

        if (validPorts.length === 0)
            return undefined;

        // Find closest port to the cursor
        return validPorts
            .map((port) => ({ port, dist: worldPos.distanceTo(port.targetPos) }))
            .reduce(MinDist).port;
    }

    public shouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): boolean {
        // Activate if the user drags or clicks on a port
        return (
            (
                (ev.type === "mousedown" && ev.button === LEFT_MOUSE_BUTTON && ev.input.touchCount === 1) ||
                (ev.type === "click")
            )
            && (this.findPort(ev.input.mousePos, circuit, viewport) !== undefined)
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (
            (this.stateType === "clicked" && ev.type === "click") ||
            (this.stateType === "dragged" && ev.type === "mouseup") ||
            (ev.type === "keydown" && ev.key === "Escape") ||
            (ev.type === "keydown" && ev.key === "Backspace") ||
            (ev.type === "mousedown" && ev.button === RIGHT_MOUSE_BUTTON)
        );
    }

    public onActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        this.curPort = this.findPort(ev.input.mousePos, circuit, viewport);

        this.stateType = (ev.type === "click" ? "clicked" : "dragged");
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        const port2 = this.findPort(ev.input.mousePos, circuit, viewport, this.curPort);
        if (port2) // Connect the ports if we found a second port
            this.curPort!.connectTo(port2);

        this.curPort = undefined;
    }

    public onEvent(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        // if (ev.type === "mousemove")
        //     circuit.forceRedraw();
    }

    public getCurPort(): Port | undefined {
        return this.curPort;
    }
}
