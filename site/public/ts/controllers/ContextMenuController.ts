import {MainDesignerController} from "./MainDesignerController";

export var ContextMenuController = (function() {
    let contextmenu = document.getElementById("context-menu");

    let onContextMenu = function(e: MouseEvent, canvas: HTMLCanvasElement): void {
        contextmenu.style.left = String(e.pageX) + 'px';
        contextmenu.style.top  = String(e.pageY) + 'px';
        if (contextmenu.offsetHeight + e.pageY > canvas.offsetHeight)
            contextmenu.style.top = String(e.pageY - contextmenu.offsetHeight) + 'px';
        contextmenu.style.visibility = 'visible';
    }

    let onMouseDown = function(e: MouseEvent): void {
        if (contextmenu.style.visibility === 'visible')
            contextmenu.style.visibility = 'hidden';
    }

    return {
        Init: function(): void {
            let canvas = MainDesignerController.GetCanvas();

            canvas.addEventListener("mousedown", function(e) {
                e.preventDefault();
                onMouseDown(e);
            });

            // Stop default right click menu
            window.addEventListener("contextmenu", function(e) {
                e.preventDefault();
                onContextMenu(e, canvas);
            });
        },
    }
})();
