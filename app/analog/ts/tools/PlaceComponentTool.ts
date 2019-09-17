import {Tool} from "./Tool";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {EEComponent} from "analog/models/eeobjects/EEComponent";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {Action} from "../actions/Action";
import {PlaceAction} from "analog/actions/addition/PlaceAction";

export class PlaceComponentTool extends Tool {

    private designer: EECircuitDesigner;
    private camera: Camera;

    private component: EEComponent;

    public constructor(designer: EECircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    public activate(): boolean {
        return false;
    }

    public deactivate(event: string): boolean {
        return (event == "onclick");
    }

    public setComponent(component: EEComponent, instant: boolean = false): void {
        this.component = component;
        if (instant) {
            // Place the object immediately
            this.designer.addObject(component);
            return;
        }
    }

    public onMouseMove(input: Input): boolean {
        const pos = this.camera.getWorldPos(input.getMousePos());
        this.component.setPos(pos);
        return true;
    }

    public onClick(): boolean {
        // Place object
        this.designer.addObject(this.component);

        return true;
    }

    public getAction(): Action {
        return new PlaceAction(this.designer, this.component);
    }

    public getComponent(): EEComponent {
        return this.component;
    }
}
