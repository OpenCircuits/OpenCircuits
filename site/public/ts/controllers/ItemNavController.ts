import {ITEMNAV_WIDTH} from "../utils/Constants";

import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {Component} from "../models/ioobjects/Component";
import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerController} from "./MainDesignerController";

export const ItemNavController = (function() {
    let mainDesigner: CircuitDesigner;

    const tab = document.getElementById("itemnav-open-tab");
    const itemnav = document.getElementById("itemnav");

    // let projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");
    //
    // let fileInput = <HTMLInputElement>document.getElementById("header-file-input");
    // let downloadButton = document.getElementById("header-download-button");
    // let downloadPDFButton = document.getElementById("header-download-pdf-button");
    // let downloadPNGButton = document.getElementById("header-download-png-button");

    let isOpen = false;
    let disabled = false;

    const open = function() {
        itemnav.style.width       = ITEMNAV_WIDTH + "px";
        tab.style.marginLeft      = (ITEMNAV_WIDTH - tab.offsetWidth) + "px";
        tab.style.borderColor     = "rgba(153, 153, 153, 0.0)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.0)";
        tab.style.fontSize        = "2.5em";
        tab.innerHTML             = "&times;";
    }

    const close = function() {
        itemnav.style.width       = "0px";
        tab.style.marginLeft      = "0px";
        tab.style.borderColor     = "rgba(153, 153, 153, 0.7)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.7)";
        tab.style.fontSize        = "2em";
        tab.innerHTML             = "&#9776;";
    }

    const place = function(component: Component) {
        MainDesignerController.PlaceComponent(component);
    }

    return {
        Init: function(designer: CircuitDesigner): void {
            mainDesigner = designer;

            tab.onclick = () => { ItemNavController.Toggle(); }

            // Set onclicks for each item
            for (let i = 0; i < itemnav.children.length; i++) {
                let child = itemnav.children[i];
                if (!(child instanceof HTMLButtonElement))
                    continue;

                const xmlId = child.dataset.xmlid;
                const not = child.dataset.not == 'true';

                child.onclick = () => { place(CreateComponentFromXML(xmlId, not)); }
            }
        },
        Toggle: function(): void {
            if (disabled)
                return;

            if (isOpen) {
                isOpen = false;
                close();
            } else {
                isOpen = true;
                open();
            }
        },
        IsOpen: function(): boolean {
            return isOpen;
        },
        Enable: function(): void {
            disabled = false;
        },
        Disable: function(): void {
            disabled = true;
        }
    }

})();
