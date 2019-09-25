import {Tool} from "core/tools/Tool";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Component} from "core/models/Component";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {Action} from "core/actions/Action";
import {PlaceAction} from "core/actions/addition/PlaceAction";

export class PlaceComponentTool extends Tool {

    private designer: DigitalCircuitDesigner;
    private camera: Camera;

    private component: Component;

    public constructor(designer: DigitalCircuitDesigner, camera: Camera) {
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

    public setComponent(component: Component, instant: boolean = false): void {
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

    public getComponent(): Component {
        return this.component;
    }
}
