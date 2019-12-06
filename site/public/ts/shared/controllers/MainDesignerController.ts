import {Vector} from "Vector";

import {CircuitView} from "site/shared/views/CircuitView";

import {RotateTool} from "core/tools/RotateTool";
import {TranslateTool} from "core/tools/TranslateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {WiringTool} from "core/tools/WiringTool";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";
import {ItemNavController} from "site/shared/controllers/ItemNavController";
import {DesignerController} from "./DesignerController";
import {SelectionPopupController} from "site/shared/controllers/SelectionPopupController";

export abstract class MainDesignerController extends DesignerController {
    protected itemNav: ItemNavController;
    protected selectionPopup: SelectionPopupController;

    private locked: boolean;

    protected constructor(designer: CircuitDesigner,
                          view: CircuitView,
                          CreateFromXML: (tag: string, not?: boolean) => Component) {
        super(designer, view);

        this.itemNav = new ItemNavController(this, CreateFromXML);
        this.selectionPopup = new SelectionPopupController(this);

        this.locked = false;

        this.toolManager.addTools(new RotateTool(this.getCamera()),
                                  new TranslateTool(this.getCamera()),
                                  new PlaceComponentTool(this.designer, this.getCamera()));

        this.getSelectionTool().addSelectionChangeListener(() => this.selectionPopup.update());
    }

    public setLocked(locked: boolean): void {
        this.locked = locked;

        // Disable some tools
        this.toolManager.setDisabled(RotateTool, locked);
        this.toolManager.setDisabled(TranslateTool, locked);
        this.toolManager.setDisabled(PlaceComponentTool, locked);
        this.toolManager.setDisabled(WiringTool, locked);

        // Disable actions/selections
        this.toolManager.disableActions(locked);
        this.clearSelections();
        this.getSelectionTool().disableSelections(locked);

        // Toggle ItemNavController
        if (this.itemNav.isOpen())
            this.itemNav.toggle();

        // Disable or re-enable ItemNavController
        if (locked)
            this.itemNav.disable();
        else
            this.itemNav.enable();

        this.render();
    }

    public placeComponent(comp: Component): void {
        const placeTool = this.toolManager.getTool(PlaceComponentTool) as PlaceComponentTool;
        placeTool.begin(comp);
    }

    public abstract loadCircuit(contents: XMLDocument): void;
    public abstract saveCircuit(): string;

    public setActive(on: boolean): void {
        super.setActive(on);

        if (!on) {
            // Hide and disable ItemNavController
            if (this.itemNav.isOpen())
                this.itemNav.toggle();
            this.itemNav.disable();
        } else {
            this.itemNav.enable();
        }
    }

    public isLocked(): boolean {
        return this.locked;
    }

    protected onMouseDrag(button: number): boolean {
        if (super.onMouseDrag(button)) {
            this.selectionPopup.hide();
            return true;
        }
        return false;
    }

    protected onMouseUp(button: number): boolean {
        if (super.onMouseUp(button)) {
            this.selectionPopup.update();
            return true;
        }
        return false;
    }

    protected onClick(button: number): boolean {
        if (super.onClick(button)) {
            this.selectionPopup.update();
            return true;
        }
        return false;
    }

    protected onKeyDown(key: number): boolean {
        if (super.onKeyDown(key)) {
            this.selectionPopup.update();
            return true;
        }
        return false;
    }

    protected onZoom(zoom: number, center: Vector): boolean {
        super.onZoom(zoom, center);

        this.selectionPopup.update();

        return true;
    }
}
