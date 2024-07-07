import {V, Vector} from "Vector";

import {Circuit, Component, isObjComponent} from "core/public";

import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";

import {Tool} from "./Tool";
import {Viewport} from "shared/circuitdesigner/Viewport";


export const ROTATION_CIRCLE_RADIUS = 1.5;
export const ROTATION_CIRCLE_THICKNESS = 0.1;

const ROTATION_SNAP_AMT = Math.PI/4;
const ROTATION_CIRCLE_THRESHOLD = ROTATION_CIRCLE_THICKNESS + 0.06;
const ROTATION_CIRCLE_R1 = (ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD) ** 2;
const ROTATION_CIRCLE_R2 = (ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD) ** 2;

export class RotateTool implements Tool {
    private components: Component[];

    private curAngles: number[];
    private curAroundAngle: number;
    private startAngle: number;
    private prevAngle: number;

    public constructor() {
        this.components = [];

        this.curAngles = [];
        this.curAroundAngle = 0;
        this.startAngle = 0;
        this.prevAngle = 0;
    }

    private isOnCircle(pos: Vector, circuit: Circuit, viewport: Viewport): boolean {
        const worldPos = viewport.curCamera.toWorldPos(pos);
        const d = worldPos.sub(circuit.selections.midpoint()).len2();

        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2);
    }

    public shouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): boolean {
        // Activate if the user pressed their mouse or finger
        //  down over the "rotation circle" which appears if
        //  there are ONLY Components being selected
        return (
            ev.type === "mousedown" &&
            ev.input.touchCount === 1 &&
            !circuit.selections.isEmpty &&
            circuit.selections.every(isObjComponent) &&
            this.isOnCircle(ev.input.mousePos, circuit, viewport)
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        this.components = circuit.selections.components;

        // Get initial angles
        this.curAngles = this.components.map((c) => c.angle);
        this.curAroundAngle = 0;
        this.startAngle = ev.input.worldMousePos.sub(circuit.selections.midpoint()).angle();
        this.prevAngle = this.startAngle;

        // Start the transaction
        circuit.beginTransaction();
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        circuit.commitTransaction();
    }

    public onEvent(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            // Get whether z is presesed for independent rotation
            const isIndependent = ev.input.keysDown.has("z");

            const midpoint = circuit.selections.midpoint();

            const dAngle = ev.input.worldMousePos.sub(midpoint).angle() - this.prevAngle;

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
            const snappedPositions = this.components
                .map((c) => V(c.x, c.y))
                .map((v) => v.rotate(snappedAroundAngle, midpoint));

            this.components.forEach((c, i) => {
                c.pos = snappedPositions[i];
                c.angle = snappedAngles[i];
            })

            this.curAngles = newAngles;
            this.curAroundAngle = newAroundAngle;

            this.prevAngle += dAngle;

            // circuit.forceRedraw();
        }
    }

    public getStartAngle() {
        return this.startAngle;
    }
    public getPrevAngle() {
        return this.prevAngle;
    }
}
