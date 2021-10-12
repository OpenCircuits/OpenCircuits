import {Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetAllPorts} from "core/utils/ComponentUtils";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {Tool}             from "core/tools/Tool";

import {IOObject, Port, Wire} from "core/models";
import { isPressable, Pressable } from "core/utils/Pressable";
import { Component } from "react";


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

        // https://github.com/OpenCircuits/OpenCircuits/issues/624 elephant
        // need to change implementation
        /**
         * loop through all objects in circuit
         * reverse list for top to bottom order
         *  is mouse in bounds of object?
         *  return empty array if yes
         * else you'll go to the next object and stuff, this will be unhelpful to me in a few days
         */
        for (let i = 0; i < objects.length; ++i) {
            
            console.log("FIND PORTS: " + objects[i]);

            if (objects[i].isWithinSelectBounds(worldMousePos) ||
                (isPressable(objects[i]) &&
                (objects[i] as Pressable).isWithinPressBounds(worldMousePos))) {
                
                console.log("object: " + i + "::" + objects[i] + " is covering any ports");
                return [];
            }
        }

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
            const {locked, input, camera, designer} = info;
            // // https://github.com/OpenCircuits/OpenCircuits/issues/624 elephant
            // // if there is a component above a port
            // // prioritize the component and skip the port click action
            // const worldMousePos = camera.getWorldPos(input.getMousePos());
            // const objs = designer.getObjects();
            // const obj: IOObject = objs.find(o => (o.isWithinSelectBounds(worldMousePos)));
            // let pressables: Pressable[] = objs.filter((c) => isPressable(c) && c.isWithinPressBounds(worldMousePos)) as Pressable[];
            // console.log("WIRING TOOL OBJ: " + obj);
            // console.log("WIRING TOOL PRESBLES: " + pressables);
            // console.log("WIRING TOOL LEN: " + pressables.length);
            // if (locked || obj != undefined || pressables.length != 0)
            // if (locked || obj != undefined)
            if (locked)
                return false;
            const ports = findPorts(info);
            // Activate if the user drags or clicks on a port
            return ((event.type === "mousedown" && input.getTouchCount() === 1) ||
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
