import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY,
        IO_PORT_RADIUS} from "../Constants";
import {Tool} from "./Tool";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Component} from "../../models/ioobjects/Component";
import {Port} from "../../models/ioobjects/Port";
import {InputPort} from "../../models/ioobjects/InputPort";
import {OutputPort} from "../../models/ioobjects/OutputPort";
import {Wire} from "../../models/ioobjects/Wire";

import {Vector,V} from "../math/Vector";
import {Transform} from "../math/Transform";
import {CircleContains} from "../math/MathUtils";

import {SelectionTool} from "./SelectionTool";

import {Input} from "../Input";
import {Camera} from "../Camera";

export class WiringTool extends Tool {

    private designer: CircuitDesigner;
    private camera: Camera;

    private port: Port;

    private wire: Wire;

    // Keep track of whether or not this tool was
    //  activated by dragging or clicking
    private clicked: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedown" || event == "onclick"))
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let objects = this.designer.getObjects();
        for (let i = objects.length-1; i >= 0; i--) {
            let obj = objects[i];
            // Check if a port was clicked
            for (let p of obj.getPorts()) {
                if (CircleContains(p.getWorldTargetPos(), IO_PORT_RADIUS, worldMousePos)) {
                    // Input ports can only have one input
                    // so if one was clicked, then don't
                    // start a new wire
                    if (p instanceof InputPort &&
                        p.getInput() != null)
                        return false;

                    // Activate
                    this.clicked = (event == "onclick");

                    this.port = p;

                    // Create wire
                    if (p instanceof InputPort) {
                        this.wire = new Wire(null, p);
                        this.wire.getShape().setP1(p.getWorldTargetPos());
                        this.wire.getShape().setC1(p.getWorldTargetPos());
                    }
                    if (p instanceof OutputPort) {
                        this.wire = new Wire(p, null);
                        this.wire.getShape().setP2(p.getWorldTargetPos());
                        this.wire.getShape().setC2(p.getWorldTargetPos());
                    }

                    return true;
                }
            }
        }
        return false;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        if (this.clicked  && event == "onclick")
            return true;
        if (!this.clicked && event == "mouseup")
            return true;
        return false;
    }

    public onMouseMove(input: Input): boolean {
        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Set one side of curve to mouse position
        let shape = this.wire.getShape();
        if (this.port instanceof InputPort) {
            shape.setP1(worldMousePos);
            shape.setC1(worldMousePos);
        }
        if (this.port instanceof OutputPort) {
            shape.setP2(worldMousePos);
            shape.setC2(worldMousePos);
        }

        return true;
    }

    public onMouseUp(input: Input, button: number): boolean {
        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let objects = this.designer.getObjects();
        for (let i = objects.length-1; i >= 0; i--) {
            let obj = objects[i];

            // Check if a port was clicked
            for (let p of obj.getPorts()) {
                if (CircleContains(p.getWorldTargetPos(), IO_PORT_RADIUS, worldMousePos)) {
                    // Connect ports
                    if (this.port instanceof InputPort && p instanceof OutputPort)
                        this.designer.createWire(p, this.port);

                    // Connect ports if not already connected
                    if (this.port instanceof OutputPort && p instanceof InputPort) {
                        // Input ports can only have one input
                        //  so don't connect if it already has one
                        if (p.getInput() != null)
                            return true;

                        this.designer.createWire(this.port, p);
                    }

                    return true;
                }
            }
        }

        return true;
    }

    public getWire(): Wire {
        return this.wire;
    }

}
