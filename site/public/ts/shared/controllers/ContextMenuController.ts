import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

export class ContextMenuController {
    private contextmenu: HTMLElement;

    public constructor(main: MainDesignerController) {
        const canvas = main.getCanvas();

        this.contextmenu = document.getElementById("context-menu");

        canvas.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.onMouseDown(e);
        });

        // Stop default right click menu
        canvas.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.onContextMenu(e, canvas);
        });
    }

    private onContextMenu(e: MouseEvent, canvas: HTMLCanvasElement): void {
        this.contextmenu.style.left = `${e.pageX}px`;
        this.contextmenu.style.top  = `${e.pageY}px`;
        if (this.contextmenu.offsetHeight + e.pageY > canvas.offsetHeight)
            this.contextmenu.style.top  = `${e.pageY - this.contextmenu.offsetHeight}px`;
        if (this.contextmenu.offsetWidth  + e.pageX > canvas.offsetWidth)
            this.contextmenu.style.left = `${e.pageX - this.contextmenu.offsetWidth}px`;
        this.show();
    }

    private onMouseDown(_: MouseEvent): void {
        this.hide();
    }
    
    public show(): void {
        this.contextmenu.classList.remove("invisible");
    }

    public hide(): void {
        this.contextmenu.classList.add("invisible");
    }
}
