import {Deserialize, Serialize} from "serialeazy";

import {Vector} from "Vector";

import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {RotateTool} from "core/tools/RotateTool";
import {TranslateTool} from "core/tools/TranslateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {WiringTool} from "core/tools/WiringTool";

import {Circuit} from "core/models/Circuit";
import {CircuitDesigner} from "core/models/CircuitDesigner";
import {CircuitMetadata,
        CircuitMetadataBuilder} from "core/models/CircuitMetadata";
import {Component} from "core/models/Component";

import {ThumnailGenerator} from "site/shared/utils/ThumbnailGenerator";

import {CircuitView} from "site/shared/views/CircuitView";

import {ItemNavController} from "site/shared/controllers/ItemNavController";
import {SelectionPopupController} from "site/shared/controllers/SelectionPopupController";
import {DesignerController} from "site/shared/controllers/DesignerController";
import {HeaderController} from "site/shared/controllers/HeaderController";

export abstract class MainDesignerController extends DesignerController {
    protected itemNav: ItemNavController;
    protected selectionPopup: SelectionPopupController;
    protected headerController: HeaderController;

    protected thumbnailGenerator: ThumnailGenerator;

    protected constructor(designer: CircuitDesigner,
                          view: CircuitView,
                          thumbnailGenerator: ThumnailGenerator,
                          CreateFromXML: (tag: string, not?: boolean) => Component) {
        super(designer, view);

        this.thumbnailGenerator = thumbnailGenerator;

        this.itemNav = new ItemNavController(this, CreateFromXML);
        this.selectionPopup = new SelectionPopupController(this);

        this.headerController = new HeaderController(this);

        this.toolManager.addTools(new RotateTool(this.getCamera()),
                                  new TranslateTool(this.getCamera()),
                                  new PlaceComponentTool(this.designer, this.getCamera()));

        this.getSelectionTool().addSelectionChangeListener(() => this.selectionPopup.update());
    }

    public setEditMode(editMode: boolean): void {
        // Disable some tools
        this.toolManager.setDisabled(RotateTool, !editMode);
        this.toolManager.setDisabled(TranslateTool, !editMode);
        this.toolManager.setDisabled(PlaceComponentTool, !editMode);
        this.toolManager.setDisabled(WiringTool, !editMode);

        // Disable actions/selections
        this.toolManager.disableActions(!editMode);
        this.clearSelections();
        this.getSelectionTool().disableSelections(!editMode);

        // Toggle ItemNavController
        if (this.itemNav.isOpen())
            this.itemNav.toggle();

        // Disable or re-enable ItemNavController
        if (editMode)
            this.itemNav.enable();
        else
            this.itemNav.disable();

        this.render();
    }

    public clearSelections(): void {
        this.addAction(CreateDeselectAllAction(this.getSelectionTool()).execute());
    }

    public placeComponent(comp: Component): void {
        const placeTool = this.toolManager.getTool(PlaceComponentTool) as PlaceComponentTool;
        placeTool.begin(comp);
    }

    public setDesigner(designer: CircuitDesigner): void {
        this.designer.replace(designer);
    }

    public loadCircuit(contents: string): CircuitMetadata {
        // This is a hack to allow golang to interface with the json easier
        const circuit = JSON.parse(contents) as Circuit;

        // Deserialize circuit
        const designer = Deserialize<CircuitDesigner>(circuit.contents);

        // Replace circuit contents with new ones (to keep references intact TODO: change this?)
        this.designer.replace(designer);

        this.render();

        return new CircuitMetadata(circuit.metadata);
    }

    public saveCircuit(thumbnail: boolean = true): string {
        const name = this.headerController.getProjectName();
        const thumb = (thumbnail) ? (this.thumbnailGenerator.generate(this.designer)) : ("data;,");

        const data = new Circuit(
            new CircuitMetadataBuilder()
                .withName(name)
                .withThumbnail(thumb)
                .build()
                .getDef(),
            Serialize(this.designer)
        );

        return JSON.stringify(data);
    }

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

    public getSelectionPopup(): SelectionPopupController {
        return this.selectionPopup;
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
