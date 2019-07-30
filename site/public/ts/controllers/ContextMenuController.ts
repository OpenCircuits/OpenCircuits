import {MainDesignerController} from "./MainDesignerController";

export const ContextMenuController = (() => {
    const contextmenu = document.getElementById("context-menu");

    const onContextMenu = function(e: MouseEvent, canvas: HTMLCanvasElement): void {
        contextmenu.style.left = `${e.pageX}px`;
        contextmenu.style.top  = `${e.pageY}px`;
        if (contextmenu.offsetHeight + e.pageY > canvas.offsetHeight)
            contextmenu.style.top = `${e.pageY - contextmenu.offsetHeight}px`;
        if (contextmenu.offsetWidth + e.pageX > canvas.offsetWidth)
            contextmenu.style.left = `${e.pageX - contextmenu.offsetWidth}px`;
        ContextMenuController.Show();
    }

    const onMouseDown = function(_: MouseEvent): void {
        ContextMenuController.Hide();
    }

    return {
        Init: function(): void {
            const canvas = MainDesignerController.GetCanvas();

            canvas.addEventListener("mousedown", function(e: MouseEvent) {
                e.preventDefault();
                onMouseDown(e);
            });

            // Stop default right click menu
            canvas.addEventListener("contextmenu", function(e: MouseEvent) {
                e.preventDefault();
                onContextMenu(e, canvas);
            });
        },
        Show: function(): void {
            contextmenu.classList.remove("invisible");
        },
        Hide: function(): void {
            contextmenu.classList.add("invisible");
        }
    }
})();
