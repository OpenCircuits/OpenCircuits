import {CircuitDesigner} from "../models/CircuitDesigner";

import {Exporter} from "../utils/io/Exporter";

export var HeaderController = (function() {
    let mainDesigner: CircuitDesigner;

    let projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");

    let fileInput = document.getElementById("header-file-input");
    let downloadButton = document.getElementById("header-download-button");
    let downloadPDFButton = document.getElementById("header-download-pdf-button");
    let downloadPNGButton = document.getElementById("header-download-png-button");

    return {
        Init: function(designer: CircuitDesigner) {
            mainDesigner = designer;

            // fileInput.onchange = () => Exporter.

            downloadButton.onclick = () => Exporter.saveFile(mainDesigner, projectNameInput.value);

            downloadPDFButton.onclick = () => {

            }

            downloadPNGButton.onclick = () => {

            }
        }
    }

})();
