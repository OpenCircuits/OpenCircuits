import {Tool} from "./Tool";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

import {Input} from "../Input";
import {Camera} from "../Camera";

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
        let pos = this.camera.getWorldPos(input.getMousePos());
        this.designer.addObject(this.component);
        this.component = undefined;
        return true;
    }

    public getComponent(): Component {
        return this.component;
    }

}
