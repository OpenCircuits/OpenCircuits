import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {IOObject} from "core/models/IOObject";
import {IOObjectSet, SerializeForCopy} from "core/utils/ComponentUtils";
import {CopyController} from "site/shared/controllers/CopyController";
import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {Deserialize} from "serialeazy";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {Component} from "core/models/Component";
import {Vector} from "Vector";
import {ActionManager} from "core/actions/ActionManager";
import {setSAVED} from "core/utils/Config";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";

export class ContextMenuController {

    private contextmenu: HTMLElement;
    private context_menu_copy: HTMLElement;
    private context_menu_cut: HTMLElement;
    private context_menu_paste: HTMLElement;
    private context_menu_undo: HTMLElement;
    private context_menu_redo: HTMLElement;
    private context_menu_selectAll: HTMLElement;

    private worldCursorPos: Vector;
    private camera: Camera;
    private input: Input;


    public constructor(main: MainDesignerController) {
        const canvas = main.getCanvas();

        //Declare elements in the right-click context menu
        this.contextmenu = document.getElementById("context-menu");
        this.context_menu_copy = document.getElementById("context-menu-copy");
        this.context_menu_cut = document.getElementById("context-menu-cut");
        this.context_menu_paste = document.getElementById("context-menu-paste");
        this.context_menu_undo = document.getElementById("context-menu-undo");
        this.context_menu_redo = document.getElementById("context-menu-redo");
        this.context_menu_selectAll = document.getElementById("context-menu-select-all");

        this.worldCursorPos = new Vector();
        //Assign Camera and Input
        this.camera = main.getCamera();
        this.input  = main.getInput();

        canvas.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();
            this.onMouseDown(e);
        });

        // Stop default right click menu
        canvas.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.onContextMenu(e, canvas);
        });

        /*Context menu "copy"*/
        this.context_menu_copy.addEventListener("click", function(){
            const selections = main.getSelections();
            const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

            if (!navigator.clipboard.writeText) {
                //if user's we browser does not support this API, show alert message
                alert("Your web browser does not support right click COPY operation.\n Please use CTRL + C");
                return;
            }
            navigator.clipboard.writeText(SerializeForCopy(objs));
        });

        /*Context menu "cut"*/
        this.context_menu_cut.addEventListener("click", function(){
            const selections = main.getSelections();
            const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

            if (!navigator.clipboard.writeText) {
                //if user's we browser does not support this API, show alert message
                alert("Your web browser does not support right click CUT operation.\n Please use CTRL + X");
                return;
            }
            navigator.clipboard.writeText(SerializeForCopy(objs));
            //Delete Selected items
            main.addAction(CreateDeselectAllAction(main.getSelectionTool()).execute());
            main.addAction(CreateDeleteGroupAction(objs).execute());

            main.render();
        });

        /*Context menu "paste"*/
        this.context_menu_paste.addEventListener("click",(e: MouseEvent)=>{
            this.onContextMenu_Paste(e,main);
        });

        /*Context menu "Undo"*/
        this.context_menu_undo.addEventListener("click",function(){
            main.getToolManager().undo();
            main.render();
        });

        /*Context menu "Redo"*/
        this.context_menu_redo.addEventListener("click",function(){
            main.getToolManager().redo();
            main.render();
        });

         /*Context menu "Select All"*/
         this.context_menu_selectAll.addEventListener("click",function(){
             main.addAction(
                 CreateGroupSelectAction(
                     main.getSelectionTool(), main.getDesigner().getObjects()).execute()
                 );
             main.render();
         });


    }

    private onContextMenu_Paste(e:MouseEvent,main: MainDesignerController){
        navigator.clipboard.readText()
            .then( text => { 
                var contents = text;
                const objs = Deserialize<IOObject[]>(contents);
                // Get all components by filtering
                const components = objs.filter((obj) => obj instanceof Component) as Component[];
                const mainDesigner = main.getDesigner();
                main.addAction(CreateAddGroupAction(mainDesigner, new IOObjectSet(objs)).execute());
                // Place items at where context menu is called (cursorPosX, cursorPosY)
                var oldGroupPos:Vector = new Vector();
                var newGroupPos = this.worldCursorPos;
                components.forEach(element=>{
                    oldGroupPos.x += element.getPos().x
                    oldGroupPos.y += element.getPos().y
                });
                oldGroupPos.x = oldGroupPos.x/components.length
                oldGroupPos.y = oldGroupPos.y/components.length
             
                var displacement:Vector = new Vector(newGroupPos.x-oldGroupPos.x,newGroupPos.y-oldGroupPos.y);
                // Translate the copies over to new location
                main.addAction(CreateGroupTranslateAction(
                    components, components.map((o) => o.getPos().add(displacement))).execute());
                main.render();
             });
    }


    private onContextMenu(e: MouseEvent, canvas: HTMLCanvasElement): void {
        this.worldCursorPos = this.getWorldMousePos(this.input);
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

    private getWorldMousePos(input:Input):Vector{
        return this.camera.getWorldPos(input.getMousePos());
    }

    // Temporarily disabled ability to show until the menu is fixed
    public show(): void {
        this.contextmenu.classList.remove("invisible");
    }

    public hide(): void {
        this.contextmenu.classList.add("invisible");
    }


}
