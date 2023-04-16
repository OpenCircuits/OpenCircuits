import {V, Vector} from "Vector";

import {Circuit, Component, isObjComponent} from "core/public";

import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";

import {Tool}           from "./Tool";
import {UserInputState} from "shared/utils/input/UserInputState";


export const ROTATION_CIRCLE_RADIUS = 1.5;
export const ROTATION_CIRCLE_THICKNESS = 0.1;

const ROTATION_SNAP_AMT = Math.PI/4;
const ROTATION_CIRCLE_THRESHOLD = ROTATION_CIRCLE_THICKNESS + 0.06;
const ROTATION_CIRCLE_R1 = (ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD) ** 2;
const ROTATION_CIRCLE_R2 = (ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD) ** 2;


// interface RotateToolState {
//     state: Tool.State;

//     components: Component[];

//     curAngles: number[];
//     curAroundAngle: number;
//     startAngle: number;
//     prevAngle: number;
// }

// function RotateTool2<S extends { rotateTool: RotateToolState }>(
//     curState: S,
//     ev: InputAdapterEvent,
//     designer: CircuitDesigner
// ) {
//     switch (curState.rotateTool.state) {
//         case Tool.State.Inactive:

//     }

//     return {
//         ...curState,
//         rotateTool: {
//             ...curState.rotateTool,
//         },
//     };
// }


export class RotateTool implements Tool<Tool.BaseState | "Pending"> {
    public readonly kind = "RotateTool";

    public state: Tool.BaseState | "Pending" = "Inactive";

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

    private isOnCircle(worldPos: Vector, circuit: Circuit): boolean {
        const d = worldPos.sub(circuit.selectionsMidpoint("world")).len2();
        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2);
    }

    private setupInitialState(circuit: Circuit, { worldMousePos }: UserInputState) {
        // Setup initial state
        this.components = circuit.selections.components;

        // Get initial angles
        this.curAngles = this.components.map((c) => c.angle);
        this.curAroundAngle = 0;
        this.startAngle = worldMousePos.sub(circuit.selectionsMidpoint("world")).angle();
        this.prevAngle = this.startAngle;
    }

    public onEvent(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        const { selections } = circuit;
        const { worldMousePos, isShiftKeyDown, keysDown, touchCount } = ev.input;

        switch (this.state) {
            case "Inactive":
                // Enter a pending state when ONLY components are being selected
                if (!selections.isEmpty && selections.every(isObjComponent))
                    this.state = "Pending";

                break;

            case "Pending":
                // Go back to inactive if things are deselected or we select a non-component
                if (selections.isEmpty || !selections.every(isObjComponent)) {
                    this.state = "Inactive";
                    break;
                }

                // Activate if the user pressed down on the "rotation circle"
                if (ev.type === "mousedown" && touchCount === 1 && this.isOnCircle(worldMousePos, circuit)) {
                    this.setupInitialState(circuit, ev.input);

                    // Start the transaction
                    circuit.beginTransaction();

                    this.state = "Active";
                }

                break;

            case "Active":
                // Deactivate when the mouse is released
                if (ev.type === "mouseup") {
                    // Commit the transaction on deactivation
                    circuit.commitTransaction();

                    this.state = "Inactive";

                    break;
                }

                if (ev.type === "mousedrag") {
                    // Get whether z is presesed for independent rotation
                    const isIndependent = keysDown.has("z");
                    const midpoint = circuit.selectionsMidpoint("world");
                    const dAngle = worldMousePos.sub(midpoint).angle() - this.prevAngle;

                    // Calculate new and snapped angles
                    const newAngles = this.curAngles.map((a) => (a + dAngle));
                    const snappedAngles = newAngles
                        .map((a) => (
                            isShiftKeyDown
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
                        isShiftKeyDown
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

                    circuit.forceRedraw();
                }

                break;
        }
    }

    public getStartAngle() {
        return this.startAngle;
    }
    public getPrevAngle() {
        return this.prevAngle;
    }
}
