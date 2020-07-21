import {Deserialize} from "serialeazy";

import {Vector} from "Vector";

import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {RotateTool} from "core/tools/RotateTool";
import {TranslateTool} from "core/tools/TranslateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {WiringTool} from "core/tools/WiringTool";

import {Circuit, ContentsData} from "core/models/Circuit";
import {CircuitDesigner} from "core/models/CircuitDesigner";
import {CircuitMetadata,
        CircuitMetadataBuilder} from "core/models/CircuitMetadata";
import {Component} from "core/models/Component";

import {ThumbnailGenerator} from "site/shared/utils/ThumbnailGenerator";

import {CircuitView} from "site/shared/views/CircuitView";

import {SelectionPopupController} from "site/shared/controllers/SelectionPopupController";
import {DesignerController} from "site/shared/controllers/DesignerController";
import {HeaderController} from "site/shared/controllers/HeaderController";

import {ItemNavController} from "./ItemNavController";
import {CopyController} from "./CopyController";

export abstract class MainDesignerController extends DesignerController {
    protected itemNav: ItemNavController;
    protected selectionPopup: SelectionPopupController;
    protected headerController: HeaderController;

    protected thumbnailGenerator: ThumbnailGenerator;

    private locked: boolean;

    protected constructor(designer: CircuitDesigner,
                          view: CircuitView,
                          thumbnailGenerator: ThumbnailGenerator) {
        super(designer, view);

        this.thumbnailGenerator = thumbnailGenerator;

        this.selectionPopup = new SelectionPopupController(this);
        this.headerController = new HeaderController(this);

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

        this.itemNav.setActive(!locked);

        this.render();
    }

    public clearSelections(): void {
        this.addAction(CreateDeselectAllAction(this.getSelectionTool()).execute());
    }

    public setPlaceToolComponent(comp: Component): void {
        const placeTool = this.toolManager.getTool(PlaceComponentTool) as PlaceComponentTool;
        placeTool.setComponent(comp);
    }

    public setDesigner(designer: CircuitDesigner): void {
        this.designer.replace(designer);
    }

    public loadCircuit(contents: string): CircuitMetadata {
        // This is a hack to allow golang to interface with the json easier
        const circuit = JSON.parse(contents) as Circuit;

        // Deserialize circuit
        const data = Deserialize<ContentsData>(circuit.contents);

        // Load camera
        this.getCamera().setPos(data.camera.getPos());
        this.getCamera().setZoom(data.camera.getZoom());

        this.clearSelections();
        this.toolManager.reset();

        // Replace circuit contents with new ones (to keep references intact TODO: change this?)
        this.designer.replace(data.designer);

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
            this.designer,
            this.getCamera()
        );

        return JSON.stringify(data);
    }

    public setActive(on: boolean): void {
        super.setActive(on);

        this.itemNav.setActive(on);
    }

    public isLocked(): boolean {
        return this.locked;
    }

    public abstract getCopyController(): CopyController;

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

    protected onDoubleClick(button: number): boolean {
        if (super.onDoubleClick(button)) {
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
