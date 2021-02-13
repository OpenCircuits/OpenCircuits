import {ICViewerView} from "../views/ICViewerView";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {IC} from "digital/models/ioobjects/other/IC";

import {Selectable} from "core/utils/Selectable";
import {DigitalCircuitController} from "./DigitalCircuitController";
import {DesignerController} from "site/shared/controllers/DesignerController";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {GetCameraFit} from "core/utils/ComponentUtils";
import {CullableObject} from "core/models/CullableObject";
import {V} from "Vector";
import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";

export class ICViewerController extends DesignerController {
    protected designer: DigitalCircuitDesigner;
    protected view: ICViewerView;

    private inside: DigitalObjectSet;

    private mainController: DigitalCircuitController;

    public constructor(mainController: DigitalCircuitController) {
        // pass Render function so that
        //  the circuit is redrawn every
        //  time its updated
        // ? not sure if this is needed just for viewing
        // ? i think it is, assuming we want to enable panning
        super(new DigitalCircuitDesigner(1, () => this.render()),
              new ICViewerView());

        this.mainController = mainController;

        this.view.setCloseButtonListener(() => this.close());

        // Disable all editing functionality
        this.toolManager.disableActions();
        this.getSelectionTool().disableSelections();

        this.hide();
    }

    private close(): void {
        this.hide();
    }

    public show(ic: IC): void {
        this.setActive(true);

        // Store copy of IC components
        this.inside = ic.getData().copy();

        // Reset designer and add the internal components
        this.designer.reset();
        this.designer.addGroup(this.inside);

        // Adjust the camera so it all fits in the viewer
        const camera = this.view.getCamera();
        const finalCamera = GetCameraFit(
            camera,
            this.inside.toList() as CullableObject[],
            IC_VIEWER_ZOOM_PADDING_RATIO
        );
        camera.setPos(finalCamera[0]);
        camera.setZoom(finalCamera[1]);
        this.view.show();

        // Render
        this.render();
        this.mainController.setActive(false);
    }

    public hide(): void {
        this.setActive(false);

        this.view.hide();
        this.mainController.setActive(true);
    }

    // TODO: how to stop user from toggling things?
    // IDEA: wrap InteractionHandler with Actions
    protected onMouseDown(button: number): boolean {
        return super.onMouseDown(button);
    }

    protected onMouseMove(): boolean {
        return super.onMouseMove();
    }

    protected onMouseDrag(button: number): boolean {
        return super.onMouseDrag(button);
    }

    protected onMouseUp(button: number): boolean {
        return super.onMouseUp(button);
    }

    public getSelections(): Selectable[] {
        return [];
    }
}
