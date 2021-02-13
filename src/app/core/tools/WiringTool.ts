import {Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetAllPorts} from "core/utils/ComponentUtils";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {Tool}             from "core/tools/Tool";

import {Port, Wire} from "core/models";


export const WiringTool = (() => {
    enum StateType {
        CLICKED,
        DRAGGED
    }

    let port: Port;
    let wire: Wire;
    let stateType: StateType;

    function findPorts({input, camera, designer}: Partial<CircuitInfo>): Port[] {
        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const objects = designer.getObjects().reverse();

        // Look through all ports in all objects
        //  and find one where the mouse is over
        return GetAllPorts(objects).filter(p => p.isWithinSelectBounds(worldMousePos));
    }
    function setWirePoint(v: Vector): void {
        // The wiring tool always starts with 1 port connected
        //  and the other point should be following the mouse
        //  so this figures out if it's the 1st or 2nd port
        const shape = wire.getShape();
        if (wire.getP1() === undefined) {
            shape.setP1(v);
            shape.setC1(v);
        } else if (wire.getP2() === undefined) {
            shape.setP2(v);
            shape.setC2(v);
        } else {
            throw new Error("Both ports are set in WiringTool!");
        }
    }

    return {
        shouldActivate(event: Event, info: CircuitInfo): boolean {
            const {locked, input, designer} = info;
            if (locked)
                return false;
            const ports = findPorts(info);
            // Activate if the user drags or clicks on a port
            return ((event.type === "mousedrag" && input.getTouchCount() === 1) ||
                    (event.type === "click")) &&
                    ports.length > 0 &&
                    designer.createWire(ports[0], undefined) !== undefined;
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Two possibilites for deactivating:
            //  1) if the port was initial clicked on,
            //      then a 2nd click is what will deactivate this
            //  2) if the port was initial dragged on,
            //      then letting go of the mouse will deactivate this
            return (stateType === StateType.CLICKED && event.type === "click") ||
                   (stateType === StateType.DRAGGED && event.type === "mouseup");
        },


        onActivate(event: Event, info: CircuitInfo): void {
            port = findPorts(info)[0];

            // Create wire and set it's other point to be at `port`
            wire = info.designer.createWire(port, undefined);
            setWirePoint(port.getWorldTargetPos());

            stateType = (event.type === "click" ? StateType.CLICKED : StateType.DRAGGED);
        },
        onDeactivate({}: Event, info: CircuitInfo): void {
            const {history, designer} = info;
            // See if we ended on a port
            const port2 = findPorts(info).find(p => wire.canConnectTo(p));
            if (port2 !== undefined)
                history.add(new ConnectionAction(designer, port, port2).execute());
        },


        onEvent(event: Event, {input, camera}: CircuitInfo): boolean {
            if (event.type !== "mousemove")
                return false;

            setWirePoint(camera.getWorldPos(input.getMousePos()));
            return true;
        },


        getWire(): Wire {
            return wire;
        }
    }
})();
