import {Circuit, Component}            from "core/public";
import {LEFT_MOUSE_BUTTON}             from "shared/utils/input/Constants";
import {InputManagerEvent}             from "shared/utils/input/InputManagerEvent";
import {SnapToConnections, SnapToGrid} from "shared/utils/SnapUtils";
import {V}                             from "Vector";
import {Tool, ToolState}               from "./Tool";


export class TranslateTool implements Tool {
    private components: Component[];

    public constructor() {
        this.components = [];

    }

    public shouldActivate(ev: InputManagerEvent, circuit: Circuit, { curPressedObjID }: ToolState): boolean {
        const curPressedObj = (curPressedObjID ? circuit.getObj(curPressedObjID) : undefined);
        // Activate if the user is pressing down on a component
        return (
            ev.type === "mousedrag"
                && ev.button === LEFT_MOUSE_BUTTON
                && curPressedObj?.baseKind === "Component"
        );
    }
    public shouldDeactivate(ev: InputManagerEvent): boolean {
        return (ev.type === "mouseup" && ev.button === LEFT_MOUSE_BUTTON);
    }

    public onActivate(ev: InputManagerEvent, circuit: Circuit, { curPressedObjID }: ToolState): void {
        const curPressedObj = (curPressedObjID ? circuit.getObj(curPressedObjID) : undefined);

        // If the pressed component is part of the selected objects,
        //  then translate all of the selected objects
        //  otherwise, just translate the pressed object
        this.components = (!curPressedObj || curPressedObj.isSelected)
            ? (circuit.selectedObjs.filter((o) => (o.baseKind === "Component"))) as Component[]
            : [curPressedObj as Component];

        circuit.beginTransaction();

        // TODO: shift components

        // Explicitly start the drag
        this.onEvent(ev, circuit);
    }

    public onDeactivate(ev: InputManagerEvent, circuit: Circuit): void {
        circuit.commitTransaction();
    }

    public onEvent(ev: InputManagerEvent, circuit: Circuit): void {
        // Using mousemove instead of mousedrag here because when a button besides
        //  mouse left is released, mousedrag events are no longer created, only mousemove.
        //  So instead mousemove is used and whether or not left mouse is still pressed is
        //  handled within the activation and deactivation of this tool.
        if (ev.type === "mousemove") {
            const snapToGrid = ev.state.isShiftKeyDown;
            const snapToConnections = !ev.state.isShiftKeyDown;

            const dPos = ev.state.deltaMousePos.scale(V(circuit.camera.zoom, -circuit.camera.zoom));

            this.components.forEach((c) => {
                let pos = V(c.x, c.y).add(dPos);
                if (snapToGrid)
                    pos = SnapToGrid(pos);
                if (snapToConnections)
                    pos = SnapToConnections(pos, c);
                // Very specifically Translate as we go
                //  as to correctly apply `SnapToConnections`
                c.pos = pos;
            });
        }
    }
}
