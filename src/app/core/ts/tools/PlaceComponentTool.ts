import {Tool} from "core/tools/Tool";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";

import {Input} from "core/utils/Input";
import {Camera} from "math/Camera";

import {Action} from "core/actions/Action";
import {PlaceAction} from "core/actions/addition/PlaceAction";

export class PlaceComponentTool extends Tool {
    private designer: CircuitDesigner;
    private camera: Camera;

    private component: Component;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    public shouldActivate(): boolean {
        return this.component != undefined;
    }

    public shouldDeactivate(event: string): boolean {
        return (event == "onclick") || this.component == undefined;
    }

    public deactivate(): Action {
        const action = new PlaceAction(this.designer, this.component);

        this.component = undefined;

        return action.execute();
    }

    public setComponent(component: Component): void {
        this.component = component;
    }

    public onMouseMove(input: Input): boolean {
        // Update position of component
        const pos = this.camera.getWorldPos(input.getMousePos());
        this.component.setPos(pos);
        return true;
    }

    public getComponent(): Component {
        return this.component;
    }
}
