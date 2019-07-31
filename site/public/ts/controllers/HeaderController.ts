import {CircuitDesigner} from "../models/CircuitDesigner";

import {Importer} from "../utils/io/Importer";
import {Exporter} from "../utils/io/Exporter";

import {MainDesignerController} from "./MainDesignerController";

export const HeaderController = (() => {
    const projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");

    const fileInput = <HTMLInputElement>document.getElementById("header-file-input");

    const downloadDropdownButton = document.getElementById("header-download-dropdown-button");
    const downloadDropdown = document.getElementById("header-download-dropdown-content");

    const downloadButton = document.getElementById("header-download-button");
    const downloadPDFButton = document.getElementById("header-download-pdf-button");
    const downloadPNGButton = document.getElementById("header-download-png-button");

    const helpButton = document.getElementById("header-help-button");

    return {
        Init: function(designer: CircuitDesigner): void {
            const mainDesigner: CircuitDesigner = designer;

            // Show/hide the dropdown on click
            downloadDropdownButton.onclick = () => {
                // Toggle a class to keep :hover behavior
                downloadDropdown.classList.toggle("show");
                downloadDropdownButton.classList.toggle("white");
            }

            // Hide dropdown on click anywhere else
            window.onclick = (e) => {
                const target: Element = (e.target || e.srcElement) as Element;
                const dropdownParent = target.closest(".header__right__dropdown");
                if (!dropdownParent) {
                    if (downloadDropdown.classList.contains("show")) {
                        downloadDropdown.classList.toggle("show");
                        downloadDropdownButton.classList.toggle("white");
                    }
                }
            }

            fileInput.onchange = () => Importer.loadFile(mainDesigner, fileInput.files[0], (n) => { if (n) projectNameInput.value = n; });

            downloadButton.onclick = () => Exporter.saveFile(mainDesigner, projectNameInput.value);

            downloadPDFButton.onclick = () => Exporter.savePDF(MainDesignerController.GetCanvas(), projectNameInput.value);

            downloadPNGButton.onclick = () => Exporter.savePNG(MainDesignerController.GetCanvas(), projectNameInput.value);
        }
    }

})();
