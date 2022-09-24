import {LEFT_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON} from "core/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {Place} from "core/actions/units/Place";

import {AnyPort} from "core/models/types";

import {CreateWire} from "core/models/utils/CreateWire";

import {PortView} from "core/views/PortView";


export const WiringTool = (() => {
    enum StateType {
        CLICKED,
        DRAGGED,
    }

    let port: AnyPort | undefined;
    let stateType: StateType;

    // "Finding the port to Wire" is not as simple as it seems.
    // This is because we need to do deal with the case where there are multiple ports really
    //  close together. When they almost overlap, if one is "above" the other, it would get iterated
    //  first, but if the mouse was closer to the "lower" one, then it's most likely the user meant to
    //  select that one.
    // So, what we do is gather all ports that could be selected and wire, then find the one that is
    //  closest to the mouse.
    function findPort({ input, camera, viewManager }: CircuitInfo): AnyPort | undefined {
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        // Gather all possible ports
        const allPorts = [...viewManager]
            .filter((view) => (view.getObj().baseKind === "Port")) as Array<PortView<AnyPort>>;
        const validPorts = allPorts
            .filter((view) => view.contains(worldMousePos, "select"))
            // Make sure port is wireable and (if we have a current port) is also
            //  wireable with our current port.
            .filter((view) => view.isWireable() && (port ? view.isWireableWith(port) : true));

        if (validPorts.length === 0)
            return undefined;

        // Find closest port to the mouse
        return validPorts
            .map((view) => ({ port: view.getObj(), dist: worldMousePos.distanceTo(view.getMidpoint()) }))
            .reduce((prev, cur) => ((prev.dist <= cur.dist) ? prev : cur)).port;
    }
    // function findNearestPort({ input, camera }: CircuitInfo, ports: Port[]): Port | undefined {
    //     const worldMousePos = camera.getWorldPos(input.getMousePos());
    //     // Look through all ports in array
    //     //  and find closest one to the mouse
    //     if (ports.length === 0)
    //         return undefined;

    //     let nearestport = ports[0];
    //     let dist = worldMousePos.distanceTo(nearestport.getWorldTargetPos());
    //     for (const port of ports) {
    //         const test = worldMousePos.distanceTo(port.getWorldTargetPos());
    //         if (test <= IO_PORT_RADIUS)
    //             return port;
    //         if (test < dist) {
    //             nearestport = port;
    //             dist = test;
    //         }
    //     }
    //     return nearestport;
    // }
    // function setWirePoint(v: Vector): void {
    //     // The wiring tool always starts with 1 port connected
    //     //  and the other point should be following the mouse
    //     //  so this figures out if it's the 1st or 2nd port
    //     const shape = wire.getShape();
    //     if (wire.getP1() === undefined) {
    //         shape.setP1(v);
    //         shape.setC1(v);
    //     } else if (wire.getP2() === undefined) {
    //         shape.setP2(v);
    //         shape.setC2(v);
    //     } else {
    //         throw new Error("Both ports are set in WiringTool!");
    //     }
    // }

    return {
        shouldActivate(event: Event, info: CircuitInfo): boolean {
            const { locked, input } = info;
            if (locked)
                return false;

            const port = findPort(info);

            // Activate if the user drags or clicks on a port
            return (
                (
                    (event.type === "mousedown" && event.button === LEFT_MOUSE_BUTTON &&
                        input.getTouchCount() === 1) ||
                    (event.type === "click")
                ) && (port !== undefined)
            );
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Two possibilites for deactivating:
            //  1) if the port was initial clicked on,
            //      then a 2nd click is what will deactivate this
            //  2) if the port was initial dragged on,
            //      then letting go of the mouse will deactivate this
            //  3) the user cancels using Escape, Backspace or RMB
            return (stateType === StateType.CLICKED && event.type === "click")  ||
                   (stateType === StateType.DRAGGED && event.type === "mouseup") ||
                   (event.type === "keydown" && event.key === "Escape") ||
                   (event.type === "keydown" && event.key === "Backspace") ||
                   (event.type === "mousedown" && event.button === RIGHT_MOUSE_BUTTON);
        },


        onActivate(event: Event, info: CircuitInfo): void {
            port = findPort(info);

            // // Create wire and set it's other point to be at `port`
            // wire = info.designer.createWire(port, undefined);
            // setWirePoint(port.getWorldTargetPos());

            stateType = (event.type === "click" ? StateType.CLICKED : StateType.DRAGGED);
        },
        onDeactivate({}: Event, info: CircuitInfo): void {
            const { circuit, history } = info;

            const port2 = findPort(info);
            if (port2 !== undefined) {
                const wire = CreateWire(circuit.getWireKind(), port!.id, port2.id);
                history.add(Place(circuit, wire));
            }

            port = undefined;
        },

        onEvent(event: Event): boolean {
            // Re-draw on mouse move for wiring preview
            return (event.type === "mousemove");
        },

        getPort(): AnyPort | undefined {
            return port;
        },
    }
})();
