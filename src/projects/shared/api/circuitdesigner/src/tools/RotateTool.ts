import {V, Vector} from "Vector";

import {Circuit, Component, isComponent} from "shared/api/circuit/public";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";

import {Tool, ToolEvent} from "./Tool";
import {Viewport} from "shared/api/circuitdesigner/public/Viewport";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {Cursor} from "../input/Cursor";


export const ROTATION_CIRCLE_RADIUS = 1.5;
export const ROTATION_CIRCLE_THICKNESS = 0.1;

const ROTATION_SNAP_AMT = Math.PI/4;
const ROTATION_CIRCLE_THRESHOLD = ROTATION_CIRCLE_THICKNESS + 0.06;
const ROTATION_CIRCLE_R1 = (ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD) ** 2;
const ROTATION_CIRCLE_R2 = (ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD) ** 2;

export class RotateTool extends ObservableImpl<ToolEvent> implements Tool {
    private components: Component[];

    // Store initial midpoint mostly for stability reasons otherwise
    // you can numerical-inaccuracy yourself into flinging the rotation
    // by switching between local and global rotation rapidly.
    private initialMidpoint: Vector;
    private initialPositions: Vector[];
    private curAngles: number[];
    private curAroundAngle: number;
    private startAngle: number;
    private prevAngle: number;

    public constructor() {
        super();

        this.components = [];

        this.initialMidpoint = V(0, 0);
        this.initialPositions = [];
        this.curAngles = [];
        this.curAroundAngle = 0;
        this.startAngle = 0;
        this.prevAngle = 0;
    }

    private isOnCircle(pos: Vector, circuit: Circuit, viewport: Viewport): boolean {
        const worldPos = viewport.camera.toWorldPos(pos);
        const d = worldPos.sub(circuit.selections.midpoint).len2();

        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2);
    }

    public indicateCouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): Cursor | undefined {
        if (!circuit.selections.isEmpty &&
            circuit.selections.every(isComponent) &&
            this.isOnCircle(ev.input.mousePos, circuit, viewport)) {
            return "grab";
        }
    }
    public shouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): boolean {
        // Activate if the user pressed their mouse or finger
        //  down over the "rotation circle" which appears if
        //  there are ONLY Components being selected
        return (
            // Must use `mousedrag` and NOT `mousedown` due to #1387
            ev.type === "mousedrag" &&
            ev.input.touchCount === 1 &&
            !circuit.selections.isEmpty &&
            circuit.selections.every(isComponent) &&
            this.isOnCircle(ev.input.mouseDownPos, circuit, viewport)
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputAdapterEvent, { circuit, viewport: { camera, canvasInfo } }: CircuitDesigner): void {
        this.components = circuit.selections.components;

        camera.publish({ type: "dragStart" });

        // Get initial angles
        this.initialMidpoint = circuit.selections.midpoint;
        this.initialPositions = this.components.map((c) => c.pos);
        this.curAngles = this.components.map((c) => c.angle);
        this.curAroundAngle = 0;
        this.startAngle = camera.toWorldPos(ev.input.mouseDownPos).sub(circuit.selections.midpoint).angle();
        this.prevAngle = this.startAngle;

        // Set cursor
        canvasInfo!.cursor = "grabbing";

        // Start the transaction
        circuit.beginTransaction();
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit, viewport: { camera } }: CircuitDesigner): void {
        circuit.commitTransaction("Rotated Object(s)");

        camera.publish({ type: "dragEnd" });
    }

    public onEvent(ev: InputAdapterEvent, { viewport: { camera } }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            // Get whether z is presesed for independent rotation
            const isIndependent = ev.input.keysDown.has("z");

            const midpoint = this.initialMidpoint;

            const dAngle = camera.toWorldPos(ev.input.mousePos).sub(midpoint).angle() - this.prevAngle;

            // Calculate new and snapped angles
            const newAngles = this.curAngles.map((a) => (a + dAngle));
            const snappedAngles = newAngles
                .map((a) => (
                    ev.input.isShiftKeyDown
                    ? (Math.floor(a/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT)
                    : a
                ));

            // Calculate new angle the rotation about the midpoint
            const newAroundAngle = (
                isIndependent
                ? this.curAroundAngle
                : this.curAroundAngle + dAngle
            );
            const snappedAroundAngle = (
                ev.input.isShiftKeyDown
                ? Math.floor(newAroundAngle/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT
                : newAroundAngle
            );

            // Calculate new, snapped positions
            const snappedPositions = this.initialPositions
                .map((c) => c.rotate(snappedAroundAngle, midpoint));

            this.components.forEach((c, i) => {
                c.pos = snappedPositions[i];
                c.angle = snappedAngles[i];
            })

            this.curAngles = newAngles;
            this.curAroundAngle = newAroundAngle;

            this.prevAngle += dAngle;

            this.publish({ type: "statechange" });
        }
    }

    public getStartAngle() {
        return this.startAngle;
    }
    public getPrevAngle() {
        return this.prevAngle;
    }
}
