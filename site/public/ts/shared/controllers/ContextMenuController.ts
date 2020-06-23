import $ from "jquery";

import {IOObject} from "core/models/IOObject";

import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

export class ContextMenuController {
    private contextMenu: JQuery<HTMLElement>;

    public constructor(main: MainDesignerController) {
        this.contextMenu = $("#context-menu");

        const canvas = main.getCanvas();
        const copyController = main.getCopyController();

        canvas.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.onMouseDown(e);
        });

        // Stop default right click menu
        canvas.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.onContextMenu(e, canvas);
        });

        /* Context menu "Copy" button */
        $("#context-menu-copy").click(async () => {
            // Check for clipboard writeText support
            if (!navigator.clipboard.writeText) {
                alert("Your web browser does not support right click COPY operation.\nPlease use CTRL + C");
                return;
            }

            await navigator.clipboard.writeText(copyController.copy(main));

            this.hide();
        });

        /* Context menu "Cut" button */
        $("#context-menu-cut").click(async () => {
            // Check for clipboard writeText support
            if (!navigator.clipboard.writeText) {
                alert("Your web browser does not support right click CUT operation.\nPlease use CTRL + X");
                return;
            }

            const objs = main.getSelections().filter(o => o instanceof IOObject) as IOObject[];

            await navigator.clipboard.writeText(copyController.copy(main));

            // Delete Selected items
            main.addAction(CreateDeselectAllAction(main.getSelectionTool()).execute());
            main.addAction(CreateDeleteGroupAction(objs).execute());

            main.render();

            this.hide();
        });

        /* Context menu "Paste" */
        $("#context-menu-paste").click(async () => {
            if (!navigator.clipboard.readText) {
                alert("Your web browser does not support right click PASTE operation.\nPlease use CTRL + P");
                return;
            }

            const data = await navigator.clipboard.readText();
            copyController.paste(data, main);

            this.hide();
        });

        /* Context menu "Undo" */
        $("#context-menu-undo").click(() => {
            main.getToolManager().undo();
            main.render();

            this.hide();
        });

        /* Context menu "Redo" */
        $("#context-menu-redo").click(() => {
            main.getToolManager().redo();
            main.render();

            this.hide();
        });

        /* Context menu "Select All" */
        $("#context-menu-select-all").click(() => {
            main.addAction(
                CreateGroupSelectAction(
                    main.getSelectionTool(), main.getDesigner().getObjects()).execute()
            );
            main.render();

            this.hide();
        });
    }

    private onContextMenu(e: MouseEvent, canvas: HTMLCanvasElement): void {
        const w = this.contextMenu.outerWidth();
        const h = this.contextMenu.outerHeight();

        const left = (w + e.pageX > canvas.offsetWidth)  ? (e.pageX - w) : (e.pageX);
        const top  = (h + e.pageY > canvas.offsetHeight) ? (e.pageY - h) : (e.pageY);

        this.contextMenu.offset({left, top});

        this.show();
    }

    private onMouseDown(_: MouseEvent): void {
        this.hide();
    }

    public show(): void {
        this.contextMenu.removeClass("invisible");
    }

    public hide(): void {
        this.contextMenu.addClass("invisible");
    }


}
