import {Input} from "../utils/Input";
import {RIGHT_MOUSE_BUTTON} from "../utils/Constants"
import {LEFT_MOUSE_BUTTON} from "../utils/Constants"

import {MainDesignerView} from "../views/MainDesignerView";
import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerController} from "./MainDesignerController";


export var ContextMenuController = (function() {
    var input: Input;
    var view: MainDesignerView;
    let mainDesigner: CircuitDesigner;
    
    let contextmenu = document.getElementById("context-menu");
    
    let onRelease =  function(e: MouseEvent, canvas: HTMLCanvasElement): void{
        if(e.button === RIGHT_MOUSE_BUTTON){
            contextmenu.style.left = String(e.pageX) + 'px';
            contextmenu.style.top = String(e.pageY) + 'px';
            if(contextmenu.offsetHeight + e.pageY > canvas.offsetHeight){
                contextmenu.style.top = String(e.pageY - contextmenu.offsetHeight) + 'px';
            }
            contextmenu.style.visibility = 'visible';
        }
    }
    
    let onClick = function(e: MouseEvent): void{
        if(contextmenu.style.visibility === 'visible'){
            contextmenu.style.visibility = 'hidden';
        }
    }

    return {
        Init: function(): void{
            let canvas = MainDesignerController.GetCanvas(); 
            
            //Mouse click input
            canvas.addEventListener("mouseup", function(e){
                e.preventDefault();
                onRelease(e, canvas);
            });

            canvas.addEventListener("mousedown", function(e){
                e.preventDefault();
                onClick(e);
            });

            //Stop default right click menu
            window.addEventListener("contextmenu", function(e){
                e.preventDefault();
            });

        },
    

    }
})();