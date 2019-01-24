import {ITEMNAV_WIDTH} from "../utils/Constants";

import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {Component} from "../models/ioobjects/Component";
import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerController} from "./MainDesignerController";

export var ItemNavController = (function() {
    let mainDesigner: CircuitDesigner;

    let tab = document.getElementById("itemnav-open-tab");
    let itemnav = document.getElementById("itemnav");

    // let projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");
    //
    // let fileInput = <HTMLInputElement>document.getElementById("header-file-input");
    // let downloadButton = document.getElementById("header-download-button");
    // let downloadPDFButton = document.getElementById("header-download-pdf-button");
    // let downloadPNGButton = document.getElementById("header-download-png-button");

    let isOpen = false;

    let open = function() {
        itemnav.style.width       = ITEMNAV_WIDTH + "px";
        tab.style.marginLeft      = (ITEMNAV_WIDTH - tab.offsetWidth) + "px";
        tab.style.borderColor     = "rgba(153, 153, 153, 0.0)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.0)";
        tab.style.fontSize        = "2.5em";
        tab.innerHTML             = "&times;";
    }

    let close = function() {
        itemnav.style.width       = "0px";
        tab.style.marginLeft      = "0px";
        tab.style.borderColor     = "rgba(153, 153, 153, 0.7)";
        tab.style.backgroundColor = "rgba(200, 200, 200, 0.7)";
        tab.style.fontSize        = "2em";
        tab.innerHTML             = "&#9776;";
    }

    let place = function(component: Component) {
        MainDesignerController.PlaceComponent(component);
    }

    return {
        Init: function(designer: CircuitDesigner) {
            mainDesigner = designer;

            tab.onclick = () => { ItemNavController.Toggle(); }

            // Set onclicks for each item
            for (let i = 0; i < itemnav.children.length; i++) {
                let child = itemnav.children[i];
                if (!(child instanceof HTMLButtonElement))
                    continue;

                let xmlId = child.dataset.xmlid;
                let not = child.dataset.not == 'true';

                child.onclick = () => { place(CreateComponentFromXML(xmlId, not)); }
            }
        },
        Toggle: function() {
            if (isOpen) {
                isOpen = false;
                close();
            } else {
                isOpen = true;
                open();
            }
        }
    }

})();
