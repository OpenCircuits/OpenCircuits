import {Tool} from "./Tool";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

import {Input} from "../Input";
import {Camera} from "../Camera";

import {Action} from "../actions/Action";
import {PlaceAction} from "../actions/PlaceAction";

export class PlaceComponentTool extends Tool {

    private designer: CircuitDesigner;
    private camera: Camera;

    private component: Component;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        return false;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        return (event == "onclick");
    }

    public setComponent(component: Component) {
        this.component = component;
    }

    public onMouseMove(input: Input): boolean {
        let pos = this.camera.getWorldPos(input.getMousePos());

        this.component.setPos(pos);

        return true;
    }

    public onClick(input: Input, button: number): boolean {
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
